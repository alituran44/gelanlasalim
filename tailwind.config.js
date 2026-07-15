/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070a13",
        card: "#0d1117",
        cardHover: "#141b27",
        border: "rgba(255,255,255,0.06)",
        accent: "#0d9488",
        accentLight: "#14b8a6",
        accentDark: "#0f766e",
        navy: "#070a13",
        navyLight: "#111827",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#6b7280",
        surface: "#0f1419",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 32px rgba(0, 0, 0, 0.5)",
        accentGlow: "0 0 24px rgba(13, 148, 136, 0.3)",
        cardGlow: "0 4px 20px rgba(13, 148, 136, 0.08)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '64px 64px',
      },
    },
  },
  plugins: [],
};
