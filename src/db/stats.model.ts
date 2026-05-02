import mongoose from "mongoose";

const statsSchema = new mongoose.Schema({                                                                                             
    date: Date,              // дата                                                                           
    uniqueVisitors: { type: Number, default: 0 },    // уникальных за день
    totalSessions: { type: Number, default: 0 },     // всего сессий
    avgDuration: { type: Number, default: 0 },       // средняя длительность в секундах
    pageViews: { type: Number, default: 0 },         // просмотров страниц
    newVisitors: { type: Number, default: 0 },       // новых
    returningVisitors: { type: Number, default: 0 }, // вернувшихся
    topPages: [{
        url: String,   //ссылка
        count: { type: Number, default: 0 } //количество посещений за день
    }],
    onlineNow: { type: Number, default: 0 },         //текущий онлайн
    onlinePick: {type: Number, default: 0}, // Пиковый онлайн
    orders: {         //заказы
      total: { type: Number, default: 0 },
      confirmed: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 },
    }
})

export const Stats = mongoose.model('Stats', statsSchema)