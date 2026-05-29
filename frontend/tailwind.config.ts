/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        accent: {
          DEFAULT: "#3B82F6",
          hover:   "#2563EB",
          soft:    "rgba(59,130,246,0.13)",
          ink:     "#ffffff",
        },
        state: {
          success:      "#34D399",
          warn:         "#FBBF24",
          danger:       "#F87171",
          "danger-soft":"rgba(248,113,113,0.13)",
        },
      },
    },
  },
  plugins: [],
}
