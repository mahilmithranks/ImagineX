/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand — emerald / teal spectrum ───────────────────────────
        brand: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",   // primary CTA
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // ── Surfaces — deep charcoal ───────────────────────────────────
        surface: {
          950: "#07070d",
          900: "#0b0b16",
          800: "#0f0f1e",
          700: "#151528",
          600: "#1c1c34",
          500: "#242440",
          400: "#2e2e54",
          300: "#3d3d6e",
          200: "#5a5a8c",
          100: "#8080a8",
        },
        muted: "#7070a0",
      },

      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        "card":        "0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        "card-hover":  "0 0 0 1px rgba(255,255,255,0.10), 0 8px 40px rgba(0,0,0,0.5)",
        "panel":       "0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.5)",
        "input":       "inset 0 1px 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)",
        "input-focus": "inset 0 1px 1px rgba(0,0,0,0.3), 0 0 0 2px rgba(16,185,129,0.30)",
        "btn":         "0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
        "btn-brand":   "0 0 0 1px rgba(16,185,129,0.4), 0 4px 16px rgba(16,185,129,0.20), inset 0 1px 0 rgba(255,255,255,0.12)",
        "glow-sm":     "0 0 16px rgba(16,185,129,0.15)",
        "glow-md":     "0 0 32px rgba(16,185,129,0.20)",
        "inner-white": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },

      backgroundImage: {
        "gradient-radial":    "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":     "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer-dark":       "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
        "btn-brand-gradient": "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
        "hero-glow":          "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(16,185,129,0.10) 0%, transparent 70%)",
      },

      animation: {
        "shimmer":    "shimmer 1.8s infinite linear",
        "fade-in":    "fadeIn 0.25s ease-out",
        "slide-up":   "slideUp 0.3s cubic-bezier(0.16,1,0.3,1)",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "spin":       "spin 1s linear infinite",
      },

      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-800px 0" },
          "100%": { backgroundPosition:  "800px 0" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)",    opacity: "0.4" },
          "50%":      { transform: "translateY(-6px)", opacity: "1"   },
        },
      },

      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
