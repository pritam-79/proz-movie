import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        proz: {
          midnight: "rgb(var(--proz-canvas) / <alpha-value>)",
          navy: "rgb(var(--proz-surface) / <alpha-value>)",
          elevated: "rgb(var(--proz-elevated) / <alpha-value>)",
          border: "rgb(var(--proz-border) / <alpha-value>)",
          purple: "rgb(var(--proz-accent) / <alpha-value>)",
          cyan: "rgb(var(--proz-gold) / <alpha-value>)",
          sky: "rgb(var(--proz-sky) / <alpha-value>)",
          white: "rgb(var(--proz-ink) / <alpha-value>)",
          grey: "rgb(var(--proz-sub) / <alpha-value>)",
          dark: "rgb(var(--proz-canvas) / <alpha-value>)",
          card: "var(--card-bg)",
          glass: "var(--card-bg)",
          "glass-hover": "var(--card-hover-bg)",
          "glass-border": "rgb(var(--proz-border) / 0.45)",
        },
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 10px 36px -6px rgba(0, 0, 0, 0.45)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.28)",
        "glass-lg": "0 16px 52px 0 rgba(0, 0, 0, 0.6)",
        "cyan-glow": "0 0 26px -6px rgba(245, 158, 11, 0.45)",
        "purple-glow": "0 0 28px -6px rgba(255, 46, 84, 0.45)",
        "ambient-glow": "0 0 50px -10px rgba(255, 46, 84, 0.25), 0 0 50px -10px rgba(245, 158, 11, 0.2)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "18px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
