/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          50:  "#FBF8F1",
          100: "#F2EEE4",
          200: "#ECE7DA",
          300: "#E2DCCB",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted:   "#FBF8F1",
        },
        ink: {
          DEFAULT: "#1C1E22",
          soft:    "#2C2F36",
          muted:   "#6B6A63",
          subtle:  "#93918A",
        },
        line: {
          DEFAULT: "#E2DCCB",
          soft:    "#EFE9DA",
        },
        sidebar: {
          DEFAULT: "#1B1D24",
          elev:    "#262932",
          line:    "#2E313B",
          text:    "#C8C5BC",
          muted:   "#8A877E",
        },
        accent: {
          DEFAULT: "#2A6F6A",
          hover:   "#225A56",
          soft:    "#DCE9E6",
          ink:     "#FFFFFF",
        },
        state: {
          success:       "#3F7A4F",
          warn:          "#B8762B",
          danger:        "#B24A3F",
          "danger-soft": "#F4E2DE",
        },
      },
    },
  },
  plugins: [],
}
