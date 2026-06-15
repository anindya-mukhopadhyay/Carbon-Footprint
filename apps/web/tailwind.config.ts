import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        soil: "#3A2E23",
        moss: "#3F6F4E",
        leaf: "#4FA36C",
        mint: "#DDF4D7",
        tide: "#1B6F78",
        skyglass: "#C9F0F4",
        sun: "#F8B84E",
        clay: "#D46A3A",
        paper: "#FFF8EA",
        ink: "#17201A"
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        glow: "0 24px 80px rgba(27, 111, 120, 0.22)",
        card: "0 20px 60px rgba(58, 46, 35, 0.12)"
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "fade-up": "fadeUp 700ms ease both"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -14px, 0)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
