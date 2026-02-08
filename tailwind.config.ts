import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          void: "#07060D",
          deep: "#0E0B1A",
          nebula: "#1A1333",
          glow: "#A78BFA",
          warm: "#F59E0B",
          heart: "#F472B6",
          calm: "#34D399",
          energy: "#60A5FA",
          fire: "#F87171",
        },
      },
      animation: {
        "breathe": "breathe 4s ease-in-out infinite",
        "orbit": "orbit 20s linear infinite",
        "fadeUp": "fadeUp 0.5s ease-out",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.7" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(120px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(120px) rotate(-360deg)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
