import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neo: {
          yellow: "#FACC15",
          red: "#EF4444",
          blue: "#3B82F6",
          green: "#22C55E",
          purple: "#A855F7",
          pink: "#EC4899",
          orange: "#F97316",
          dark: "#0F172A",
          cream: "#FEF08A",
          muted: "#64748B",
        },
      },
      boxShadow: {
        brutal: "6px 6px 0px 0px rgba(0,0,0,1)",
        "brutal-lg": "10px 10px 0px 0px rgba(0,0,0,1)",
        "brutal-sm": "4px 4px 0px 0px rgba(0,0,0,1)",
        "brutal-yellow": "6px 6px 0px 0px #FACC15",
        "brutal-red": "6px 6px 0px 0px #EF4444",
        "brutal-green": "6px 6px 0px 0px #22C55E",
        "brutal-blue": "6px 6px 0px 0px #3B82F6",
      },
      fontFamily: {
        display: ["Space Grotesk", "Archivo Black", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
        bounce: "bounce 1.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
