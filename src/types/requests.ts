import { UtmI } from "./sessionShema";

export interface PageviewI {
    visitorId: string,
    url: string,
    ip: string,
    userAgent: string,
    referrer: string,
    utm: UtmI
}

export interface EventI {
    visitorId: string,
    sessionId: string,
    type: "click" | "scroll" | "cart_add" | "cart_remove",
    url: string,
    payload: string
}

export interface OrderI {
    status: "confirmed" | "cancelled"
}