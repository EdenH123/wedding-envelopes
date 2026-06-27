import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-heebo)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-heebo)", "serif"],
      },
      colors: {
        gold: {
          50: "#fbf6e8",
          100: "#f6e9c4",
          200: "#efd590",
          300: "#e7bd57",
          400: "#e0a92f",
          500: "#d4af37", // classic gold
          600: "#b8902b",
          700: "#946f24",
          800: "#785a26",
          900: "#664c25",
        },
        ink: {
          900: "#0a0612",
          800: "#120a22",
          700: "#1b1033",
          600: "#271748",
        },
      },
      boxShadow: {
        glow: "0 0 60px -10px rgba(212,175,55,0.55)",
        "glow-sm": "0 0 24px -6px rgba(212,175,55,0.5)",
        card: "0 10px 40px -12px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-22px) rotate(3deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "rise-in": {
          "0%": { transform: "translateY(40px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "crown-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(-4deg)" },
          "50%": { transform: "translateY(-12px) rotate(4deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0", transform: "scale(0.4)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        "count-flash": {
          "0%": { transform: "scale(1.4)", filter: "brightness(2)" },
          "100%": { transform: "scale(1)", filter: "brightness(1)" },
        },
        "roulette-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(1440deg)" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: "1" },
          "50%": { opacity: "0.55" },
          "55%": { opacity: "1" },
        },
        "grow-up": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        "drop-in": {
          "0%": { opacity: "0", transform: "translateY(-40px) scale(0.5) rotate(-15deg)" },
          "70%": { opacity: "1", transform: "translateY(4px) scale(1.1) rotate(6deg)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1) rotate(0deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "20%": { transform: "translateX(-6px) rotate(-2deg)" },
          "40%": { transform: "translateX(6px) rotate(2deg)" },
          "60%": { transform: "translateX(-4px) rotate(-1.5deg)" },
          "80%": { transform: "translateX(4px) rotate(1.5deg)" },
        },
        "ring-expand": {
          "0%": { transform: "translate(-50%, -50%) scale(0)", opacity: "0.7" },
          "100%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0" },
        },
        "flash-out": {
          "0%": { opacity: "0.6" },
          "100%": { opacity: "0" },
        },
        "flap-open": {
          "0%": { transform: "perspective(600px) rotateX(0deg)" },
          "100%": { transform: "perspective(600px) rotateX(-175deg)" },
        },
        "fade-out-up": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1.3)" },
        },
        "spotlight-pulse": {
          "0%, 100%": { opacity: "0.35", transform: "scale(0.9)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 18s ease infinite",
        float: "float 5s ease-in-out infinite",
        "float-slow": "float-slow 7s ease-in-out infinite",
        "pop-in": "pop-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "rise-in": "rise-in 0.6s ease-out both",
        shimmer: "shimmer 3s linear infinite",
        "pulse-glow": "pulse-glow 2.6s ease-in-out infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "crown-bounce": "crown-bounce 2.4s ease-in-out infinite",
        twinkle: "twinkle 1.8s ease-in-out infinite",
        wiggle: "wiggle 0.4s ease-in-out infinite",
        "count-flash": "count-flash 0.5s ease-out",
        "roulette-spin": "roulette-spin 4.5s cubic-bezier(0.16, 0.84, 0.2, 1) forwards",
        "neon-flicker": "neon-flicker 2.2s ease-in-out infinite",
        "grow-up": "grow-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "drop-in": "drop-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        shake: "shake 0.4s ease-in-out infinite",
        "ring-expand": "ring-expand 0.9s ease-out forwards",
        "flash-out": "flash-out 0.5s ease-out forwards",
        "flap-open": "flap-open 0.6s ease-in forwards",
        "fade-out-up": "fade-out-up 0.9s ease-out forwards",
        "spotlight-pulse": "spotlight-pulse 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
