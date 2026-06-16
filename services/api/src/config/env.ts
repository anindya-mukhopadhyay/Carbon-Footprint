import { z } from "zod";
import { join } from "path";
import fs from "fs";

if (process.env["NODE_ENV"] !== "production") {
  const possiblePaths = [
    join(process.cwd(), ".env"),
    join(process.cwd(), "../.env"),
    join(process.cwd(), "../../.env"),
    join(process.cwd(), "services/api/.env"),
  ];
  for (const p of possiblePaths) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    if (fs.existsSync(p)) {
      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const content = fs.readFileSync(p, "utf-8");
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const index = trimmed.indexOf("=");
          if (index === -1) continue;
          const key = trimmed.slice(0, index).trim();
          let value = trimmed.slice(index + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          process.env[key] = value;
        }
        break;
      } catch (err) {
        console.warn(`Could not read env file ${p}:`, err);
      }
    }
  }
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  ALLOWED_ORIGINS: z.string().default("http://localhost:5173"),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_STORAGE_BUCKET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  VERTEX_PROJECT_ID: z.string().optional(),
  VERTEX_LOCATION: z.string().default("us-central1"),
  VERTEX_MODEL: z.string().default("gemini-2.0-flash"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  CARBON_CORE_URL: z.string().url().default("http://localhost:8090"),
  FIELD_ENCRYPTION_KEY: z.string().optional(),
  ENABLE_CSRF: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true")
});

export const env = envSchema.parse(process.env);
