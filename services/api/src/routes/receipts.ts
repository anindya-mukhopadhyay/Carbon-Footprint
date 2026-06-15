import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { analyzeReceipt } from "../services/vision.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    callback(null, allowed.includes(file.mimetype));
  }
});

export const receiptsRouter = Router();

receiptsRouter.post(["/receipts/analyze", "/analyze"], requireAuth, upload.single("receipt"), async (req, res) => {
  if (!req.file || !req.user) {
    res.status(400).json({ error: "Receipt file is required" });
    return;
  }
  res.json(await analyzeReceipt(req.file, req.user.uid));
});
