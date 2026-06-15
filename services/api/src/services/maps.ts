import { env } from "../config/env.js";

export type GreenPlace = {
  name: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
};

export async function findGreenPlaces(lat: number, lng: number, type = "recycling") {
  if (!env.GOOGLE_MAPS_API_KEY) {
    return fallbackPlaces(lat, lng);
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.set("location", `${lat},${lng}`);
  url.searchParams.set("radius", "5000");
  url.searchParams.set("keyword", type);
  url.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const response = await fetch(url);
  if (!response.ok) {
    return fallbackPlaces(lat, lng);
  }

  const data = (await response.json()) as {
    results?: Array<{
      name?: string;
      vicinity?: string;
      geometry?: { location?: { lat?: number; lng?: number } };
    }>;
  };

  return (
    data.results?.slice(0, 8).map((place) => ({
      name: place.name ?? "Green place",
      type,
      address: place.vicinity ?? "Address unavailable",
      lat: place.geometry?.location?.lat ?? lat,
      lng: place.geometry?.location?.lng ?? lng
    })) ?? fallbackPlaces(lat, lng)
  );
}

function fallbackPlaces(lat: number, lng: number): GreenPlace[] {
  return [
    {
      name: "Community recycling center",
      type: "recycling",
      address: "Demo location near you",
      lat: lat + 0.01,
      lng: lng + 0.01
    },
    {
      name: "EV charging station",
      type: "ev_charging",
      address: "Demo charging hub",
      lat: lat - 0.012,
      lng: lng + 0.008
    },
    {
      name: "Tree plantation drive",
      type: "community_event",
      address: "Demo green event",
      lat: lat + 0.006,
      lng: lng - 0.014
    }
  ];
}
