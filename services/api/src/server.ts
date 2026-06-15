import { createApp } from "./app.js";
import { env } from "./config/env.js";

const server = createApp().listen(env.PORT, () => {
  console.info(`EcoTrack API listening on port ${env.PORT}`);
});

function shutdown(signal: string) {
  console.info(`${signal} received; closing server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
