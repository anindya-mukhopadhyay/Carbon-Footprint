import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import { carbonInputSchema } from "../services/carbon.js";
import { simulateCarbonTwin } from "../services/twin.js";

const twinSchema = z.object({
  profile: carbonInputSchema
});

export const twinRouter = Router();

twinRouter.post("/simulate", validateBody(twinSchema), async (request, response, next) => {
  try {
    const body = request.body as z.infer<typeof twinSchema>;
    const result = await simulateCarbonTwin(body.profile);
    response.json(result);
  } catch (error) {
    next(error);
  }
});
