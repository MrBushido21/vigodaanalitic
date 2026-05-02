import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    sessionId: String,     // ссылка на сессию (из какой сессии это событие)
    visitorId: String,     // ссылка на посетителя                                                               
    type: {
        type: String,
        enum: ["click", "scroll", "cart_add", "cart_remove", "search", "checkout_click", "order_submit"]
    },
    url: String,
    payload: String,
    data: { type: mongoose.Schema.Types.Mixed, default: null },
    timestamp: Date
})

export const Events = mongoose.model('Events', eventSchema)