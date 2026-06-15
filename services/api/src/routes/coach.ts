import { Router } from "express";
import { z } from "zod";
import { optionalAuth } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/security.js";
import { generateCoachResponse } from "../services/gemini.js";

const requestSchema = z.object({
  message: z.string().trim().min(2).max(1000),
  locale: z.string().trim().min(2).max(10).default("en"),
  context: z
    .object({
      monthlyKg: z.number().nonnegative().max(100_000).optional()
    })
    .default({})
});

export const coachRouter = Router();

coachRouter.post(["/coach", "/chat"], aiLimiter, optionalAuth, async (req, res) => {
  const input = requestSchema.parse(req.body);
  const response = await generateCoachResponse(input);
  res.json(response);
});
