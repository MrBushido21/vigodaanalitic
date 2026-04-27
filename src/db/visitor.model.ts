import mongoose from "mongoose";

 const visitorSchem = new mongoose.Schema({                                                                                            
    visitorId: String,        //UUID из cookie (главный идентификатор)
    firstSeen: Date,        //когда впервые зашёл                                                             
    lastSeen: Date,         //когда последний раз был
    totalSessions: Number,    //сколько всего визитов
    isReturning: Boolean,      //вернувшийся или новый
    country: String,          //страна (берём из последней сессии)
    city: String             //город
  })

  export const Visitors = mongoose.model('Visitors', visitorSchem)