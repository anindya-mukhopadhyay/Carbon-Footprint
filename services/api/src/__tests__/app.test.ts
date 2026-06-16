import request from "supertest";
import { createApp } from "../app.js";
import { env } from "../config/env.js";

env.VERTEX_PROJECT_ID = ""; // Disable live API in tests

vi.mock("../config/firebase.js", () => ({
  firebaseAuth: { verifyIdToken: vi.fn() },
  firestore: {}
}));

describe("EcoTrack API", () => {
  const app = createApp();

  it("reports health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("calculates carbon with the local fallback", async () => {
    const response = await request(app).post("/api/v1/calculate").send({
      transportMode: "car",
      distanceKm: 24,
      electricityKwh: 7.5,
      lpgKg: 0.4,
      naturalGasTherms: 0.2,
      solarKwh: 1.5,
      diet: "mixed",
      shoppingSpend: 18,
      onlineOrders: 1,
      clothingItems: 0,
      electronicsSpend: 4
    });

    expect(response.status).toBe(200);
    expect(response.body.monthlyKg).toBeGreaterThan(0);
    expect(response.body.annualKg).toBe(response.body.dailyKg * 365);
  });

  it("rejects invalid input", async () => {
    const response = await request(app).post("/api/v1/calculate").send({ distanceKm: -1 });
    expect(response.status).toBe(400);
  });

  it("returns a deterministic coach response without credentials", async () => {
    const response = await request(app).post("/api/v1/coach").send({
      message: "How can I improve my commute?",
      locale: "en",
      context: { monthlyKg: 612 }
    });
    expect(response.status).toBe(200);
    expect(response.body.actions).toHaveLength(3);
  });
});
