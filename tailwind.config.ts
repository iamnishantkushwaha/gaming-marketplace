import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#14161e",
          900: "#1a1d28",
          850: "#20232f",
          800: "#282c3a",
          700: "#343948",
          600: "#454b5e",
          500: "#5b6278",
          400: "#818999",
          300: "#a5abbb",
          200: "#cdd0da",
          100: "#f0f1f4",
        },
        brand: {
          50: "#fff4ec",
          100: "#ffe4cc",
          200: "#ffc699",
          300: "#ffa15c",
          400: "#fa8130",
          500: "#e8630f",
          600: "#c04f0c",
          700: "#983f10",
          800: "#7a3414",
          900: "#5f2b14",
          glow: "#ffab6b",
        },
        accent: {
          teal: "#2dd4bf",
          amber: "#eab308",
          rose: "#fb7185",
          green: "#34d399",
          blue: "#38bdf8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.18)",
        elevated: "0 8px 20px -6px rgba(0,0,0,0.35)",
        header: "0 1px 0 rgba(255,255,255,0.03)",
      },
      letterSpacing: {
        tightish: "-0.011em",
      },
    },
  },
  plugins: [],
};
export default config;
