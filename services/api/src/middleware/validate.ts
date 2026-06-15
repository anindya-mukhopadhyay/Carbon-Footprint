import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (request: Request, response: Response, next: NextFunction) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) {
      return response.status(400).json({
        error: "ValidationError",
        details: parsed.error.flatten()
      });
    }

    request.body = parsed.data;
    return next();
  };
}
