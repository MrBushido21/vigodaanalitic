import { EventI, OrderI, PageviewI } from "../types/requests";
import { Events } from "../db/event.model";
import { Stats } from "../db/stats.model";
import { classifyReferrer, getToday } from "../utils/utils";
import { isBot } from "ua-parser-js/bot-detection";
import { UAParser } from "ua-parser-js";
import geoip from 'geoip-lite'
import { Visitors } from "../db/visitor.model";
import { Sessions } from "../db/session.model";

export const trackEvent = async (event: EventI) => {
    try {
        const newEvent = new Events(event)
        await newEvent.save();
        return
    } catch (error) {
        console.error(error);
        throw new Error('Не вдалося зберегти данні, спробуйте ще раз')
    }
}


export const trackOrder = async (orderStatus: OrderI) => {
    try {
        const today = getToday()
        const field = orderStatus.status === "confirmed" ? "orders.confirmed" : "orders.cancelled"

        await Stats.findOneAndUpdate(
            { date: today },
            { $inc: { "orders.total": 1, [field]: 1 } },
            { upsert: true, returnDocument: 'after' }
        )
    } catch (error) {
        console.error(error);
    }
}


export const trackPageview = async (body: PageviewI) => {

    const isbot = isBot(body.userAgent)
    const result = new UAParser(body.userAgent).getResult()
    const geo = geoip.lookup(body.ip)

    try {
        const existingVisitor = await Visitors.findOne({ visitorId: body.visitorId })
        await Visitors.findOneAndUpdate(
            { visitorId: body.visitorId },
            {
                $set: { "lastSeen": new Date(), isReturning: !!existingVisitor },
                $setOnInsert: { visitorId: body.visitorId, firstSeen: new Date(), country: geo?.country, city: geo?.city }
            },
            { upsert: true, returnDocument: 'after' }
        )
        const idleLimit = new Date(Date.now() - 30 * 60 * 1000)
        await Sessions.updateMany(
            { visitorId: body.visitorId, endTime: null, lastActivity: { $lt: idleLimit } },
            { $set: { endTime: new Date() } }
        )

        const session = await Sessions.findOne({ visitorId: body.visitorId, endTime: null, lastActivity: { $gte: idleLimit } })

        if (session) {
            const sessionPages = session.toObject().pages
            const lastPage = sessionPages[sessionPages.length - 1]
            lastPage.timeSpent = Math.round((new Date().getTime() - new Date(lastPage.enteredAt!).getTime()) / 1000)
            sessionPages.push({ url: body.url, enteredAt: new Date(), timeSpent: null })

            const updated = await Sessions.findOneAndUpdate(
                { _id: session._id },
                { $set: { pages: sessionPages, lastActivity: new Date() } },
                { returnDocument: 'after' }
            )
            return updated!._id
        }

        const newSession = await Sessions.create({
            visitorId: body.visitorId,
            startTime: new Date(),
            endTime: null,
            duration: null,
            isBot: isbot,
            location: geo ? { country: geo.country, city: geo.city } : {},
            device: { type: result.device.type ?? 'desktop', os: result.os.name, browser: result.browser.name },
            pages: [{ url: body.url, enteredAt: new Date(), timeSpent: null }],
            lastActivity: new Date(),
            referrer: body.referrer,
            referrerType: classifyReferrer(body.referrer),
            utm: { source: body.utm?.source, medium: body.utm?.medium, campaign: body.utm?.campaign }
        })
        await Visitors.findOneAndUpdate(
            { visitorId: body.visitorId },
            { $inc: { totalSessions: 1 } }
        )
        return newSession._id
    } catch (error) {
        console.error('[trackPageview error]', error);
        throw error
    }
}

export const trackEndSession = async (sessionId: string) => {
    try {
        const session = await Sessions.findOne({ _id: sessionId })
        const duration = Math.round((new Date().getTime() - new Date(session!.startTime!).getTime()) / 1000)
        await Sessions.findOneAndUpdate(
            { _id: sessionId },
            { $set: { endTime: new Date(), duration } },
            { returnDocument: 'after' }
        )
    } catch (error) {
        console.error(error);
    }
}

export const getCurrentOnline = async () => {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        const count = await Sessions.countDocuments({ lastActivity: { $gte: fiveMinutesAgo } })
        return count
    } catch (error: any) {
        console.error(error);
        throw new Error(error)
    }
}

export const getVisitors = async () => {
    const today = getToday()
    const total = await Visitors.countDocuments()
    const newToday = await Visitors.countDocuments({ firstSeen: { $gte: today } })
    const returningToday = await Visitors.countDocuments({ isReturning: true, lastSeen: { $gte: today } })
    return { total, newToday, returningToday }
}

export const getSources = async () => {
    const today = getToday()
    const sessions = await Sessions.find({ startTime: { $gte: today } }, { referrerType: 1 })
    const counts: Record<string, number> = { direct: 0, search: 0, social: 0, referral: 0 }
    for (const s of sessions) {
        const type = s.referrerType ?? 'direct'
        if (type in counts) counts[type]++
    }
    return counts
}

export const getDevices = async () => {
    const today = getToday()
    const sessions = await Sessions.find({ startTime: { $gte: today } }, { 'device.type': 1 })
    const counts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 }
    for (const s of sessions) {
        const type = s.device?.type ?? 'desktop'
        if (type in counts) counts[type]++
    }
    return counts
}

export const getFunnel = async () => {
    const productViews = await Sessions.countDocuments({ 'pages.url': /^\/product\// })
    const cartAdds = await Events.countDocuments({ type: 'cart_add' })
    const checkoutClicks = await Events.countDocuments({ type: 'checkout_click' })
    const checkouts = await Sessions.countDocuments({ 'pages.url': '/order' })

    const orderSubmitRaw = await Events.aggregate([
        { $match: { type: 'order_submit' } },
        { $group: { _id: '$data.status', count: { $sum: 1 } } }
    ])
    const orderSubmits = { success: 0, validation: 0, error: 0 }
    for (const row of orderSubmitRaw) {
        if (row._id in orderSubmits) orderSubmits[row._id as keyof typeof orderSubmits] = row.count
    }

    const topClicked = await Sessions.aggregate([
        { $unwind: '$pages' },
        { $match: { 'pages.url': /^\/product\// } },
        { $group: { _id: '$pages.url', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, url: '$_id', count: 1 } }
    ])

    const topCartItems = await Events.aggregate([
        { $match: { type: 'cart_add', 'data.name': { $exists: true } } },
        { $group: { _id: { name: '$data.name', color: '$data.color' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, name: '$_id.name', color: '$_id.color', count: 1 } }
    ])

    const topSearches = await Events.aggregate([
        { $match: { type: 'search', payload: { $exists: true, $ne: '' } } },
        { $group: { _id: '$payload', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, query: '$_id', count: 1 } }
    ])

    return { productViews, cartAdds, checkoutClicks, checkouts, orderSubmits, topClicked, topCartItems, topSearches }
}

export type StatsPeriod = 'today' | 'week' | 'month' | 'year'

export const getStats = async (param: StatsPeriod) => {
    const week = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    const month = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
    const year = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)
    let stat
    try {
        switch (param) {
            case "today":
                stat = await Stats.findOne({date: getToday()})
                break;
            case "week":
                stat = await Stats.find({date: {$gte: week}})
                break;
            case "month":
                stat = await Stats.find({ date: { $gte: month } })
                break;
            case "year":
                stat = await Stats.find({date: {$gte: year}})
                break;
            default:
                stat = await Stats.findOne({date: getToday()})
                break;
        }
        
        return stat
    } catch (error) {
        console.error('[getStats error]', error)
        throw error
    }
}