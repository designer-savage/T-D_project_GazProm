/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        canvas: {
          50:  "#08090F",
          100: "#0D0E1A",
          200: "#11131F",
          300: "#191B2D",
        },
        surface: {
          DEFAULT: "#13152A",
          muted:   "#0D0E1A",
        },
        ink: {
          DEFAULT: "#E2E4EE",
          soft:    "#B8BCCE",
          muted:   "#8B90A8",
          subtle:  "#525770",
        },
        line: {
          DEFAULT: "#FFFFFF14",
          soft:    "#FFFFFF0A",
        },
        sidebar: {
          DEFAULT: "#080910",
          elev:    "#0F1118",
          line:    "#1A1D2E",
          text:    "#9097B0",
          muted:   "#525770",
        },
        accent: {
          DEFAULT: "#6C63FF",
          hover:   "#5950D8",
          soft:    "#6C63FF20",
          ink:     "#FFFFFF",
        },
        state: {
          success:       "#34D399",
          warn:          "#FBBF24",
          danger:        "#F87171",
          "danger-soft": "#F8717120",
        },
      },
    },
  },
  plugins: [],
}
