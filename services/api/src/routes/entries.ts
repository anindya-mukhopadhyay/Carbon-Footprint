import { FieldValue } from "firebase-admin/firestore";
import { Router } from "express";
import { z } from "zod";
import { firestore } from "../config/firebase.js";
import { requireAuth } from "../middleware/auth.js";

const entrySchema = z.object({
  category: z.enum(["transport", "energy", "food", "lifestyle"]),
  emissionKg: z.number().nonnegative().max(100_000),
  source: z.enum(["manual", "receipt", "integration"]).default("manual"),
  occurredAt: z.string().datetime()
});

export const entriesRouter = Router();

entriesRouter.get("/entries", requireAuth, async (req, res) => {
  const snapshot = await firestore
    .collection("users")
    .doc(req.user!.uid)
    .collection("footprints")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

entriesRouter.post("/entries", requireAuth, async (req, res) => {
  const entry = entrySchema.parse(req.body);
  const reference = await firestore
    .collection("users")
    .doc(req.user!.uid)
    .collection("footprints")
    .add({
      ...entry,
      userId: req.user!.uid,
      createdAt: FieldValue.serverTimestamp()
    });
  res.status(201).json({ id: reference.id });
});
