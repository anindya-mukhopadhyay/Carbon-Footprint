import { Router } from "express";
import { z } from "zod";
import { optionalAuth } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/security.js";
import { forecastEmissions } from "../services/vertex.js";

const predictionSchema = z.object({
  history: z.array(z.number().nonnegative().max(100_000)).min(2).max(36)
});

export const predictionsRouter = Router();

predictionsRouter.post(["/predictions", "/forecast"], aiLimiter, optionalAuth, async (req, res) => {
  const { history } = predictionSchema.parse(req.body);
  res.json(await forecastEmissions(history));
});
