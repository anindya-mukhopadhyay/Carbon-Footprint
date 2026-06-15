export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "EcoTrack AI API",
    version: "1.0.0",
    description:
      "Secure API for carbon calculation, Gemini coaching, AI carbon twin simulations, Vertex forecasts, Vision OCR, Maps, and community impact."
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "Carbon" },
    { name: "Coach" },
    { name: "Twin" },
    { name: "Predictions" },
    { name: "OCR" },
    { name: "Maps" },
    { name: "Community" }
  ],
  paths: {
    "/carbon/calculate": {
      post: {
        tags: ["Carbon"],
        summary: "Calculate daily, weekly, monthly, and annual carbon footprint.",
        responses: {
          "200": { description: "Carbon calculation result" },
          "400": { description: "Validation error" }
        }
      }
    },
    "/coach/chat": {
      post: {
        tags: ["Coach"],
        summary: "Ask Gemini for personalized sustainability coaching.",
        responses: {
          "200": { description: "AI answer and measurable actions" }
        }
      }
    },
    "/twin/simulate": {
      post: {
        tags: ["Twin"],
        summary: "Simulate AI Carbon Twin lifestyle scenarios.",
        responses: {
          "200": { description: "Projected scenario emissions and savings" }
        }
      }
    },
    "/predictions/forecast": {
      post: {
        tags: ["Predictions"],
        summary: "Generate Vertex AI monthly carbon forecasts.",
        responses: {
          "200": { description: "Forecast points and confidence score" }
        }
      }
    },
    "/ocr/analyze": {
      post: {
        tags: ["OCR"],
        summary: "Analyze electricity bills, fuel receipts, or shopping receipts with Vision OCR.",
        responses: {
          "200": { description: "Extracted text, inferred values, and estimated emissions" }
        }
      }
    },
    "/maps/places": {
      get: {
        tags: ["Maps"],
        summary: "Find nearby green places using Google Maps Platform.",
        responses: {
          "200": { description: "Nearby recycling centers, EV chargers, events, or transport hubs" }
        }
      }
    },
    "/challenges": {
      get: {
        tags: ["Community"],
        summary: "List sustainability challenges.",
        responses: {
          "200": { description: "Challenge list" }
        }
      },
      post: {
        tags: ["Community"],
        summary: "Create a sustainability challenge.",
        security: [{ bearerAuth: [] }],
        responses: {
          "201": { description: "Created challenge" },
          "401": { description: "Authentication required" }
        }
      }
    },
    "/leaderboard": {
      get: {
        tags: ["Community"],
        summary: "List leaderboard standings.",
        responses: {
          "200": { description: "Leaderboard entries" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "Firebase ID token"
      }
    }
  }
};
