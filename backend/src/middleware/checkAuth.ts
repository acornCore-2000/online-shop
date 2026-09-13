import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";

interface AuthPayload {
  id: number;
  uuid: string;
}

declare global {
  namespace Express {
    interface Request {
      user: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;

  if (typeof token !== "string" || token.length === 0) {
    return next(new AppError(401, "Authentication required"));
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    return next(new AppError(500, "JWT secret is not configured"));
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ["HS256"],
    }) as AuthPayload;

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "number" ||
      typeof decoded.uuid !== "string"
    ) {
      return next(new AppError(401, "Invalid token payload"));
    }
    req.user = decoded as AuthPayload;

    next();
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }
}
