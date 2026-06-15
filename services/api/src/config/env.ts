import { z } from "zod";

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
