import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FAF8F5",
          100: "#F0EBE3",
          200: "#E5DED3",
        },
        bronze: {
          300: "#C4A882",
          400: "#B09672",
          500: "#9B8A6E",
        },
        brown: {
          600: "#8A7458",
          700: "#6B5D4A",
          800: "#4A3F33",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        serif: ["Noto Serif SC", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

export default config;
