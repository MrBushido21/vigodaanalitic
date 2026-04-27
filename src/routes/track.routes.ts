import { Request, Router } from "express"
import { EventI, OrderI, PageviewI } from "../types/requests"

const router = Router()

router.post('/track/pageview', (req:Request<{}, {}, PageviewI>, res) => {
    //     ← вызывается при каждом запросе на VigodaShop                                                      
    //     ← создаёт/обновляет сессию, обновляет visitor                                                      
})
router.post('/track/event', (req:Request<{}, {}, EventI>, res) => {
//     ← вызывается с клиента при действии пользователя                                                 
//     ← пишет в events коллекцию
})
router.post('/track/order', (req:Request<{}, {}, OrderI>, res) => {
//     ← вызывается из админки при смене статуса заказа
//     ← инкрементирует счётчик в stats
})
                                              

export default router