import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";

const querySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  type: z.enum(["electric_vehicle_charging_station", "transit_station", "recycling_center"])
});

export const mapsRouter = Router();

mapsRouter.get("/places", async (req, res) => {
  const query = querySchema.parse(req.query);
  if (!env.GOOGLE_MAPS_API_KEY || env.GOOGLE_MAPS_API_KEY === "replace-me" || !env.GOOGLE_MAPS_API_KEY.startsWith("AIza")) {
    res.json({ places: [], configured: false });
    return;
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.formattedAddress"
    },
    body: JSON.stringify({
      includedTypes: [query.type],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: query.latitude, longitude: query.longitude },
          radius: 5000
        }
      }
    })
  });

  if (!response.ok) {
    res.status(502).json({ error: "Google Places request failed" });
    return;
  }
  res.json(await response.json());
});
