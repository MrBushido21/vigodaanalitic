import { NextFunction, Request, Response } from "express";

export const auth = (req: Request, res: Response, next: NextFunction) => {
   const key = req.headers['x-internal-key']
      if (key === process.env.INTERNAL_KEY) {
          return next()
      }
      return res.status(403).json({ error: "Доступ запрещён" })
}