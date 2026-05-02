import { UtmI } from "./sessionShema";

export type EventTypeT = "click" | "scroll" | "cart_add" | "cart_remove" | "search" | "checkout_click" | "order_submit"

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
    payload?: string,
    data?: Record<string, any>
}

export interface OrderI {
    status: "confirmed" | "cancelled"
}