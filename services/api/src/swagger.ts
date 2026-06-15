export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "EcoTrack AI API",
    version: "1.0.0",
    description: "Secure API for carbon calculation, AI coaching, predictions, and receipt OCR."
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      firebaseAuth: { type: "http", scheme: "bearer", bearerFormat: "Firebase ID token" }
    }
  },
  paths: {
    "/calculate": {
      post: {
        summary: "Calculate a monthly and annual carbon footprint",
        responses: { "200": { description: "Calculated footprint" } }
      }
    },
    "/coach": {
      post: {
        summary: "Ask the Gemini sustainability coach",
        responses: { "200": { description: "Personalized coaching response" } }
      }
    },
    "/predictions": {
      post: {
        summary: "Forecast future emissions with Vertex AI",
        responses: { "200": { description: "Three-month forecast with confidence interval" } }
      }
    },
    "/receipts/analyze": {
      post: {
        security: [{ firebaseAuth: [] }],
        summary: "Extract carbon-relevant data from a receipt with Vision AI",
        responses: { "200": { description: "Extracted receipt fields" } }
      }
    },
    "/entries": {
      get: {
        security: [{ firebaseAuth: [] }],
        summary: "List the authenticated user's footprint entries",
        responses: { "200": { description: "Footprint entries" } }
      },
      post: {
        security: [{ firebaseAuth: [] }],
        summary: "Create a footprint entry",
        responses: { "201": { description: "Entry created" } }
      }
    }
  }
} as const;
