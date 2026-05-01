import mongoose from "mongoose";
const sessionSchema = new mongoose.Schema({
    visitorId: { type: String, index: true }, //UUID из cookie (кто пришёл)
    startTime: Date,  //когда зашёл
    endTime: Date,    //когда ушёл
    duration: Number,   //длительность в секундах
    isBot: Boolean, //флаг бот/не бот
    lastActivity: Date, 
    location: { //Локация :
        country: String,
        city: String
    },
    device: {   //устройство (вложенные объекты)
        type: { type: String },
        os: String,
        browser: String
    },
    pages: [{   //Страницы
        url: String,
        enteredAt: Date, //когда зашёл на страницу
        timeSpent: Number //сколько пробыл на странице в секундах
    }],
    referrer: String,   //Источник трафика
    referrerType: String,   //direct / search / social / referral
    utm: { 
        source: String, //откуда (instagram, google, telegram)
        medium: String, //  тип (post, cpc, email)
        campaign: String //название кампании (sale2026, blackfriday)
    }
});

export const Sessions = mongoose.model('Sessions', sessionSchema);