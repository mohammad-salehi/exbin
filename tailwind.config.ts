// tailwind.config.js

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2fa2dc", 
          dark: "#4fc2fc",
        },
        BgPrimary: {
          DEFAULT: "#EAF6FC", 
          dark: "#5e5e5e",
        },
        titleText: {
          DEFAULT: "#606060", 
          dark: "#dcdcdc", 
        },
        redError: {
          DEFAULT: "#ff0000", 
          dark: "#ff4d4d",
        },
        bgColor: {
          DEFAULT: "#FBFAFA",
          dark: "#181818",
        },
        boxColor: {
          DEFAULT: "#FFFFFF",
          dark: "#2c2c2c",
        },
      },
      fontFamily: {
        iranSans: ["IRANSansXFaNum", "sans-serif"],
      },
    },
  },
  presets: [require("@heathmont/moon-themes")],
};

export default config;
