import z from "zod";

export const PageViewSchema = z.object({
    body: z.object({
        visitorId: z.string().min(1, { message: 'visitorId не должен быть пустым' }),
        url: z.string().min(1, { message: 'url не должен быть пустым' }),
        ip: z.string().min(1, { message: 'IP адрес не должен быть пустым' }),
        userAgent: z.string().min(1, { message: 'userAgent не должен быть пустым' }),
        referrer: z.string().optional().default(''),
        utm: z.object({
            source: z.string().optional().default(''),
            medium: z.string().optional().default(''),
            campaign: z.string().optional().default('')
        }).optional().default({ source: '', medium: '', campaign: '' })
    })
});

export const EventSchema = z.object({
    body: z.object({
        visitorId: z.string().min(1, { message: 'visitorId не должен быть пустым' }),
        sessionId: z.string().min(1, { message: 'sessionId не должен быть пустым' }),
        type: z.enum(["click", "scroll", "cart_add", "cart_remove", "search"], { message: 'Неверный тип события' }),
        url: z.string().min(1, { message: 'url не должен быть пустым' }),
        payload: z.string().optional().default('')
    })
});

export const OrderSchema = z.object({
    body: z.object({
        status: z.enum(["confirmed", "cancelled"], { message: 'Неверный статус заказа' })
    })
});

export const EndSessionSchema = z.object({
      body: z.object({                                                                                 
          sessionId: z.string().min(1, { message: 'sessionId не должен быть пустым' })                 
      })                                                                                               
  })