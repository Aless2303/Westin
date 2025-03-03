import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // Add this line to include src directory
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "metin-dark": "#1a1510",
        "metin-brown": "#2c1e14",
        "metin-gold": "#c8a458",
        "metin-red": "#8b2e2e",
        "metin-light": "#e8d0a9"
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "shake-slow": "shake 2.5s ease-in-out infinite",
        "slide-up": "slideUp 0.8s ease-out",
        "fade-pulse": "fadePulse 1.5s ease-out"
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        fadePulse: {
          "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.8)" },
          "50%": { opacity: "0.7", transform: "translate(-50%, -50%) scale(1.2)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.8)" }
        }
      },
      boxShadow: {
        "3xl": "0 25px 50px -12px rgba(0, 0, 0, 0.35)"
      }
    },
  },
  plugins: [],
} satisfies Config;