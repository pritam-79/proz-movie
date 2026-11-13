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
          midnight: "#080B12",
          navy: "#111827",
          border: "#334155",
          purple: "#8B5CF6",
          cyan: "#22D3EE",
          white: "#F8FAFC",
          grey: "#94A3B8",
          // Extended shades for depth
          dark: "#05070B",
          card: "rgba(17, 24, 39, 0.65)",
          glass: "rgba(17, 24, 39, 0.4)",
          "glass-hover": "rgba(30, 41, 59, 0.55)",
          "glass-border": "rgba(51, 65, 85, 0.45)",
          "glass-border-bright": "rgba(34, 211, 238, 0.35)",
          "glass-border-purple": "rgba(139, 92, 246, 0.35)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "glass-sm": "0 4px 16px 0 rgba(0, 0, 0, 0.35)",
        "glass-lg": "0 12px 48px 0 rgba(0, 0, 0, 0.6)",
        "cyan-glow": "0 0 25px -5px rgba(34, 211, 238, 0.4)",
        "purple-glow": "0 0 25px -5px rgba(139, 92, 246, 0.4)",
        "ambient-glow": "0 0 50px -10px rgba(139, 92, 246, 0.25), 0 0 50px -10px rgba(34, 211, 238, 0.25)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-cyan": "glowCyan 3s ease-in-out infinite alternate",
        "glow-purple": "glowPurple 3s ease-in-out infinite alternate",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        glowCyan: {
          "0%": { boxShadow: "0 0 15px rgba(34, 211, 238, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(34, 211, 238, 0.5)" },
        },
        glowPurple: {
          "0%": { boxShadow: "0 0 15px rgba(139, 92, 246, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
