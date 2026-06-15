import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} was not found` });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  res.status(500).json({
    error: process.env["NODE_ENV"] === "production" ? "Unexpected server error" : message
  });
}
