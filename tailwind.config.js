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
        background: "#090a0f",
        card: "#11141c",
        border: "rgba(255,255,255,0.06)",
        accent: "#e27d60",
        success: "#4ade80",
        warning: "#f4a261",
        muted: "#8a8f98",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 30px rgba(0, 0, 0, 0.4)",
        accentGlow: "0 0 20px rgba(226, 125, 96, 0.35)",
      }
    },
  },
  plugins: [],
};
