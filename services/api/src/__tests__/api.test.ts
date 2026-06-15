import request from "supertest";
import { createApp } from "../app.js";

const app = createApp();

const profile = {
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
};

describe("EcoTrack AI API", () => {
  it("returns health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body.status).toBe("ok");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("calculates a carbon footprint", async () => {
    const response = await request(app).post("/api/v1/carbon/calculate").send(profile).expect(200);

    expect(response.body.dailyKg).toBeGreaterThan(0);
    expect(response.body.categoryBreakdown).toHaveLength(4);
  });

  it("rejects invalid carbon input", async () => {
    await request(app)
      .post("/api/v1/carbon/calculate")
      .send({ ...profile, distanceKm: -1 })
      .expect(400);
  });

  it("returns a Gemini coach fallback without credentials", async () => {
    const response = await request(app)
      .post("/api/v1/coach/chat")
      .send({ message: "What should I do first?", profile })
      .expect(200);

    expect(response.body.answer).toContain("Start with one repeatable change");
    expect(response.body.actions.length).toBeGreaterThan(0);
  });

  it("returns maps fallback places without a Maps key", async () => {
    const response = await request(app).get("/api/v1/maps/places?latitude=22.5726&longitude=88.3639&type=transit_station").expect(200);

    expect(response.body.places.length).toBe(0); // since GOOGLE_MAPS_API_KEY is not set in tests
  });
});
