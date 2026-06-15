import crypto from "node:crypto";
import { Storage } from "@google-cloud/storage";
import vision from "@google-cloud/vision";
import { env } from "../config/env.js";

const visionClient = new vision.ImageAnnotatorClient();
const storage = new Storage();

export async function analyzeReceipt(
  file: Express.Multer.File,
  userId: string
): Promise<{ text: string; amount?: number; electricityKwh?: number; storagePath?: string }> {
  let storagePath: string | undefined;
  if (env.FIREBASE_STORAGE_BUCKET) {
    const safeName = `${Date.now()}-${crypto.randomUUID()}.${extensionFor(file.mimetype)}`;
    storagePath = `receipts/${userId}/${safeName}`;
    await storage.bucket(env.FIREBASE_STORAGE_BUCKET).file(storagePath).save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
      metadata: { cacheControl: "private, max-age=0, no-store" }
    });
  }

  const [result] = await visionClient.documentTextDetection({ image: { content: file.buffer } });
  const text = result.fullTextAnnotation?.text ?? "";
  return {
    text,
    amount: extractNumber(text, /(?:total|amount)[^\d]{0,12}([\d,.]+)/i),
    electricityKwh: extractNumber(text, /([\d,.]+)\s*(?:kwh|units?)/i),
    ...(storagePath ? { storagePath } : {})
  };
}

function extractNumber(text: string, pattern: RegExp): number | undefined {
  const match = pattern.exec(text)?.[1]?.replaceAll(",", "");
  const number = match ? Number(match) : Number.NaN;
  return Number.isFinite(number) ? number : undefined;
}

function extensionFor(mime: string): string {
  if (mime === "application/pdf") return "pdf";
  if (mime === "image/png") return "png";
  return "jpg";
}
