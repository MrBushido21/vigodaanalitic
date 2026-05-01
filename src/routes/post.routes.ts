import { Request, Router } from "express"
import { EventI, OrderI, PageviewI } from "../types/requests"
import { trackEndSession, trackEvent, trackOrder, trackPageview } from "../services/track.service"
import { validation } from "../middleware/validation.middleware"
import { EndSessionSchema, EventSchema, OrderSchema, PageViewSchema } from "../schemas/zodSchema"
import { auth } from "../middleware/auth.middleware"

const router = Router()

router.post('/track/pageview', auth, validation(PageViewSchema), async (req: Request<{}, {}, PageviewI>, res) => {
    //     ← вызывается при каждом запросе на VigodaShop                                                      
    //     ← создаёт/обновляет сессию, обновляет visitor  
    try {
        const sessionId = await trackPageview(req.body)
        return res.status(200).json({sessionId})
    } catch (error) {
        return res.status(500).json({ error: 'Iternal server error' })
    }
})
router.post('/track/event', validation(EventSchema), async (req: Request<{}, {}, EventI>, res) => {
    //     ← вызывается с клиента при действии пользователя                                                 
    //     ← пишет в events коллекцию
    try {
        await trackEvent(req.body)
        res.sendStatus(200)
    } catch (error) {
        return res.status(500).json({ error: 'Iternal server error' })
    }
})
router.post('/track/order', auth, validation(OrderSchema), async (req: Request<{}, {}, OrderI>, res) => {
    //     ← вызывается из админки при смене статуса заказа
    //     ← инкрементирует счётчик в stats

    try {
        await trackOrder(req.body)
        res.sendStatus(200)
    } catch (error) {
        return res.status(500).json({ error: 'Iternal server error' })
    }
})
router.post('/track/endsession', auth, validation(EndSessionSchema), async (req: Request, res) => {
    try {
        await trackEndSession(req.body.sessionId)
        res.sendStatus(200)
    } catch (error) {
        return res.status(500).json({ error: 'Iternal server error' })
    }
})


export default router