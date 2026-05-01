import cron from 'node-cron';
import { getToday } from '../utils/utils';
import { Sessions } from '../db/session.model';
import { Visitors } from '../db/visitor.model';
import { Stats } from '../db/stats.model';

cron.schedule('*/5 * * * *', async () => {
    try {
        const today = getToday()

        const [sessions, visitors, totalSessions] = await Promise.all([
            Sessions.find({ startTime: { $gte: today } }),
            Visitors.find({ lastSeen: { $gte: today } }),
            Sessions.countDocuments({ startTime: { $gte: today } })
        ])

        const pages: any[] = []
        let sumDuration = 0

        for (const session of sessions) {
            pages.push(...session.pages)
            sumDuration += session.duration ?? 0
        }

        const uniqueVisitors = new Set(sessions.map(s => s.visitorId)).size
        const newVisitors = visitors.filter(v => new Date(v.firstSeen!).getTime() >= today).length
        const returningVisitors = visitors.filter(v => v.isReturning && new Date(v.lastSeen!).getTime() >= today).length
        const avgDuration = sessions.length ? Math.floor(sumDuration / sessions.length) : 0

        const topPagesMap = new Map<string, number>()
        for (const page of pages) {
            topPagesMap.set(page.url, (topPagesMap.get(page.url) ?? 0) + 1)
        }
        const topPages = Array.from(topPagesMap, ([url, count]) => ({ url, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        await Stats.findOneAndUpdate(
            { date: today },
            {
                $set: {
                    totalSessions,
                    uniqueVisitors,
                    newVisitors,
                    returningVisitors,
                    avgDuration,
                    pageViews: pages.length,
                    topPages
                }
            },
            { upsert: true, returnDocument: 'after' }
        )

        console.log(`[stats cron] updated: sessions=${totalSessions}, visitors=${uniqueVisitors}`)
    } catch (error) {
        console.error('[stats cron error]', error)
    }
})
