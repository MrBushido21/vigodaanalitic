import { UtmI } from "./sessionShema";

export type EventTypeT = "click" | "scroll" | "cart_add" | "cart_remove"

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
    type: EventTypeT,
    url: string,
    payload: string
}

export interface OrderI {
    status: "confirmed" | "cancelled"
}