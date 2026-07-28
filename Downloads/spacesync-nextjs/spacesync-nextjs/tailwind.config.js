/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171f",
        paper: "#f6f7fb",
        card: "#ffffff",
        border: "#e3e6ed",
        muted: "#6b7280",
        primary: {
          DEFAULT: "#4640de",
          dark: "#332fb0",
          soft: "#edecfd",
        },
        teal: {
          DEFAULT: "#0f9e8e",
          soft: "#e2f6f3",
        },
        amber: {
          DEFAULT: "#f0a202",
          soft: "#fdf1da",
        },
        coral: {
          DEFAULT: "#e5484d",
          soft: "#fbe6e6",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
