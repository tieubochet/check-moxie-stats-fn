import type { Config } from "tailwindcss";

const defaultTheme = require('tailwindcss/defaultTheme')

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./@/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    // js files primarily because in dist
    "./node_modules/frames.js/dist/**/*.{ts,tsx,js,css}",
    "./node_modules/@frames.js/render/dist/*.{ts,tsx,js,css}",
    "./node_modules/@frames.js/render/dist/**/*.{ts,tsx,js,css}",

    // monorepo weirdness
    "../../node_modules/frames.js/dist/**/*.{ts,tsx,js,css}",
    "../../node_modules/@frames.js/render/dist/*.{ts,tsx,js,css}",
    "../../node_modules/@frames.js/render/dist/**/*.{ts,tsx,js,css}",
  ],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        baloo: ['"Baloo 2"', ...defaultTheme.fontFamily.sans]
      }
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
  },
} satisfies Config;

export default config;
