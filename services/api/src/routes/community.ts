import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";

const challengeSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(1000),
  targetKg: z.number().min(1).max(100000),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime()
});

const challenges = [
  {
    id: "no-car-week",
    title: "No-Car Week",
    description: "Use public transport, cycling, walking, or EV pooling for seven days.",
    targetKg: 120,
    participants: 1840
  },
  {
    id: "plastic-free-week",
    title: "Plastic-Free Week",
    description: "Avoid single-use plastic purchases and upload receipt proof.",
    targetKg: 48,
    participants: 1320
  }
];

export const communityRouter = Router();

communityRouter.get("/challenges", (_request, response) => {
  response.json({ challenges });
});

communityRouter.post("/challenges", requireAuth, validateBody(challengeSchema), (request, response) => {
  response.status(201).json({
    challenge: {
      id: crypto.randomUUID(),
      ownerId: request.user?.uid,
      ...(request.body as z.infer<typeof challengeSchema>)
    }
  });
});

communityRouter.get("/leaderboard", (_request, response) => {
  response.json({
    leaderboard: [
      { rank: 1, name: "Maya", score: 9820, badge: "Climate Champion", city: "Kolkata" },
      { rank: 2, name: "Anindya", score: 9460, badge: "Planet Protector", city: "Kolkata" },
      { rank: 3, name: "Riya", score: 9010, badge: "Eco Warrior", city: "Bengaluru" }
    ]
  });
});
