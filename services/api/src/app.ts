import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { csrfProtection, standardLimiter, uploadLimiter } from "./middleware/security.js";
import { carbonRouter } from "./routes/carbon.js";
import { coachRouter } from "./routes/coach.js";
import { communityRouter } from "./routes/community.js";
import { entriesRouter } from "./routes/entries.js";
import { healthRouter } from "./routes/health.js";
import { mapsRouter } from "./routes/maps.js";
import { predictionsRouter } from "./routes/predictions.js";
import { receiptsRouter } from "./routes/receipts.js";
import { twinRouter } from "./routes/twin.js";
import { openApiDocument } from "./swagger.js";

export function createApp() {
  const app = express();
  const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", ...allowedOrigins]
        }
      },
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || allowedOrigins.includes(origin));
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type", "X-CSRF-Token"]
    })
  );
  app.use(compression());
  app.use(hpp());
  app.use((pinoHttp as any)({ redact: ["req.headers.authorization", "req.headers.cookie"] }));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));
  app.use(standardLimiter);
  app.use(csrfProtection);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "ecotrack-api", timestamp: new Date().toISOString() });
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  // Mount namespaces
  app.use("/api/v1/carbon", carbonRouter);
  app.use("/api/v1/coach", coachRouter);
  app.use("/api/v1/predictions", predictionsRouter);
  app.use("/api/v1/receipts", uploadLimiter, receiptsRouter);
  app.use("/api/v1/ocr", uploadLimiter, receiptsRouter);
  app.use("/api/v1/maps", mapsRouter);
  app.use("/api/v1/twin", twinRouter);
  app.use("/api/v1/health", healthRouter);

  // Mount at root of api for compatibility
  app.use(
    "/api/v1",
    carbonRouter,
    coachRouter,
    communityRouter,
    entriesRouter,
    healthRouter,
    mapsRouter,
    predictionsRouter,
    receiptsRouter,
    twinRouter
  );
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
