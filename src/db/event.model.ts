import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    sessionId: String,     // ссылка на сессию (из какой сессии это событие)
    visitorId: String,     // ссылка на посетителя                                                               
    type: {                // тип события: "click" / "scroll" / "cart_add" / "cart_remove"
        type:String,
        enum: ["click", "scroll", "cart_add", "cart_remove"]
    },         
    url: String,           // на какой странице произошло
    payload: String,       // доп. данные (например какой товар добавил в корзину)
    timestamp: Date     // когда произошло
})

export const Events = mongoose.model('Events', eventSchema)