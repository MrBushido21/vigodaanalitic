import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodObject } from "zod";

export const validation = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params
        })
        return next()
    } catch (error) {
        if (error instanceof ZodError) {
    return res.status(400).json({ errors: error.issues });
  }      
    }
}