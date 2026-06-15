import type { NextFunction, Request, Response } from "express";
import { firebaseAuth } from "../config/firebase.js";

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    req.user = await firebaseAuth.verifyIdToken(token, true);
    next();
  } catch {
    next();
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    req.user = await firebaseAuth.verifyIdToken(token, true);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired authentication token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = typeof req.user?.["role"] === "string" ? req.user["role"] : "user";
    if (!roles.includes(role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

function bearerToken(req: Request): string | undefined {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice(7);
}
