import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./ui/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px"
      }
    },
    extend: {
      colors: {
        brand: {
          gold: "#EFB036"
        }
      },
      boxShadow: {
        glow: "0 0 30px rgba(239, 176, 54, 0.5)",
        premium: "0px 25px 50px -12px rgba(0, 0, 0, 0.15)"
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(33, 33, 33, 0.85))"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
