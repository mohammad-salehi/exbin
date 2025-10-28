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
          dark: "rgb(94,94,93)",
        },
        titleText: {
          DEFAULT: "#606060", 
          dark: "#dcdcdc", 
        },
        redError: {
          DEFAULT: "#ff0000", 
          dark: "#ff4d4d",
        },
        GreenError: {
          DEFAULT: "rgb(27,96,33)", 
          dark: "rgb(38,250,175)",
        },
        bgColor: {
          DEFAULT: "#FBFAFA",
          dark: "#343a3f",
        },
        boxColor: {
          DEFAULT: "#FFFFFF",
          dark: "#494b50",
        },
        boxBorderColor: {
          DEFAULT: "#D8D8D8",
          dark: "#6B6E74",
        },
        boxColor2: {
          DEFAULT: "#54565C",
          dark: "#494b50",
        },
        boxBorderColor2: {
          DEFAULT: "#D8D8D8",
          dark: "#6B6E74",
        },
        buttonColor: {
          DEFAULT: "#FFFFFF",
          dark: "#54565C",
        },
        buttonBorderColor: {
          DEFAULT: "#ededed",
          dark: "#6B6E74",
        },
        buttonSelectedColor: {
          DEFAULT: "#eaf6fc",
          dark: "#54565C",
        },
        buttonSelectedBorderColor: {
          DEFAULT: "#9fd4ef",
          dark: "#2fa2dc",
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
