import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { calculateCarbon, carbonInputSchema } from "../services/carbon.js";

export const carbonRouter = Router();

carbonRouter.post("/calculate", optionalAuth, async (req, res) => {
  const input = carbonInputSchema.parse(req.body);
  const result = await calculateCarbon(input);
  res.json(result);
});
