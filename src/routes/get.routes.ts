import { Router } from "express"
import type { Request, Response } from "express"
import { auth } from "../middleware/auth.middleware"
import { getCurrentOnline, getDevices, getFunnel, getSources, getStats, getVisitors } from "../services/track.service"
import type { StatsPeriod } from "../services/track.service"

const router = Router()

router.get('/analytics/online', auth, async (req: Request, res: Response) => {
    try {
        const online = await getCurrentOnline()
        return res.status(200).json({ online })
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/analytics/stats', auth, async (req: Request, res: Response) => {
    const param = req.query.period
    const validPeriods: StatsPeriod[] = ['today', 'week', 'month', 'year']
    if (!param || typeof param !== 'string' || !validPeriods.includes(param as StatsPeriod)) {
        return res.status(400).json({ error: 'Укажи period: today, week, month, year' })
    }
    try {
        const stats = await getStats(param as StatsPeriod)
        return res.status(200).json({ stats })
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/analytics/visitors', auth, async (req: Request, res: Response) => {
    try {
        const visitors = await getVisitors()
        return res.status(200).json(visitors)
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/analytics/sources', auth, async (req: Request, res: Response) => {
    try {
        const sources = await getSources()
        return res.status(200).json(sources)
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/analytics/devices', auth, async (req: Request, res: Response) => {
    try {
        const devices = await getDevices()
        return res.status(200).json(devices)
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

router.get('/analytics/funnel', auth, async (req: Request, res: Response) => {
    try {
        const funnel = await getFunnel()
        return res.status(200).json(funnel)
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
