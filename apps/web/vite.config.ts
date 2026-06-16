/// <reference types="vitest" />
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src")
    }
  },
  build: {
    target: "es2022",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          firebase: ["firebase/app", "firebase/auth", "firebase/analytics", "firebase/messaging", "firebase/firestore"],
          react: ["react", "react-dom"],
          lucide: ["lucide-react"],
          ui: [
            "@radix-ui/react-tabs",
            "@radix-ui/react-progress",
            "@radix-ui/react-dialog",
            "@radix-ui/react-tooltip",
            "@hookform/resolvers",
            "react-hook-form",
            "zod"
          ]
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test-setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
});
