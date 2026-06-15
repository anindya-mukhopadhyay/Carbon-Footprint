import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again shortly." }
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "AI request limit reached. Please wait one minute." }
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Upload limit reached. Please try again later." }
});

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (!env.ENABLE_CSRF || ["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = parseCookies(req.header("cookie") ?? "")["ecotrack_csrf"];
  const headerToken = req.header("x-csrf-token");
  if (
    !cookieToken ||
    !headerToken ||
    cookieToken.length !== headerToken.length ||
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    res.status(403).json({ error: "CSRF validation failed" });
    return;
  }

  next();
}

function parseCookies(cookie: string): Record<string, string> {
  return Object.fromEntries(
    cookie
      .split(";")
      .map((item) => item.trim().split("="))
      .filter((parts): parts is [string, string] => parts.length === 2)
  );
}
