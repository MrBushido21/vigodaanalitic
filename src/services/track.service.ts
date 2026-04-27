import { EventI, OrderI, PageviewI } from "../types/requests";
import { Events } from "../db/event.model";
import { Stats } from "../db/stats.model";
import { getToday } from "../utils/utils";
import { isBot } from "ua-parser-js/bot-detection";
import { UAParser } from "ua-parser-js";
import geoip from 'geoip-lite'

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

// trackOrder — простой:
//   1. Найти документ Stats за сегодня
//   2. Инкрементировать orders.total
//   3. Инкрементировать orders.confirmed или orders.cancelled
//   4. Если документа нет — создать новый

export const trackOrder = async (orderStatus: OrderI) => {
    const today = getToday()
    const field = orderStatus.status === "confirmed" ? "orders.confirmed" : "orders.cancelled"

    await Stats.findOneAndUpdate(
        { date: today },
        { $inc: { "orders.total": 1, [field]: 1 } },
        { upsert: true, new: true }
    )
}

// 1. Проверить isBot по userAgent                                                                      
//      → если бот: сохранить сессию с isBot: true и выйти                                                
                                                                                                       
//   2. Распарсить userAgent (ua-parser-js)                                                               
//      → достать browser, os, device.type
                                                                                                       
//   3. Распарсить IP (geoip-lite)
//      → достать country, city

//   4. Найти visitor по visitorId
//      → если не найден: создать нового (firstSeen = now, totalSessions = 1, isReturning = false)
//      → если найден: обновить lastSeen, totalSessions + 1, isReturning = true

//   5. Найти активную сессию
//      → активная = та же visitorId + endTime не установлен
//      → если не найдена: создать новую сессию
//      → если найдена: добавить страницу в pages[]

//   6. Обновить страницу в сессии
//      → push { url, enteredAt: now, timeSpent: 0 }
//      → предыдущей странице в массиве проставить timeSpent

export const trackPageview = async (body: PageviewI) => {
    //Проверить isBot по userAgent
    const isbot = isBot(body.userAgent)
    //Распарсить userAgent (ua-parser-js)
    const parser = new UAParser(body.userAgent)                                                               
    const result = parser.getResult()
    // result.browser.name  → "Chrome"                                                                   
  // result.os.name       → "Windows"                                                                  
  // result.device.type   → "mobile" | "tablet" | undefined (undefined = desktop)

  //Распарсить IP (geoip-lite)
  const geo = geoip.lookup(body.ip)
} 