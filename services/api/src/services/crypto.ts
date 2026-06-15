import crypto from "node:crypto";
import { env } from "../config/env.js";

const algorithm = "aes-256-gcm";

function getKey() {
  if (env.FIELD_ENCRYPTION_KEY) {
    const key = Buffer.from(env.FIELD_ENCRYPTION_KEY, "base64");
    if (key.length === 32) {
      return key;
    }
  }

  return crypto.createHash("sha256").update("ecotrack-ai-local-development-key").digest();
}

export function encryptField(value: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptField(value: string) {
  const [iv, tag, encrypted] = value.split(".");
  if (!iv || !tag || !encrypted) {
    throw new Error("Invalid encrypted field");
  }

  const decipher = crypto.createDecipheriv(algorithm, getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encrypted, "base64")),
    decipher.final()
  ]).toString("utf8");
}
