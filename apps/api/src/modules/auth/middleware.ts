import type { NextFunction, Request, Response } from "express"
import { AppError } from "../../lib/errors.js"
import { verifyToken } from "./crypto.js"

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string }
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Missing or invalid Authorization header"))
  }

  try {
    const payload = await verifyToken(header.slice(7))
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    next(new AppError(401, "Invalid or expired token"))
  }
}
