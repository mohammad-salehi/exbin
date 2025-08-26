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
          DEFAULT: "#2fa2dc", // رنگ اصلی برند در لایت مود
          dark: "#1e88b4", // رنگ اصلی برند در دارک مود
        },
        titleText: {
          DEFAULT: "#606060", // رنگ متن عمومی در لایت مود
          dark: "#dcdcdc", // رنگ متن عمومی در دارک مود
        },
        redError: {
          DEFAULT: "#ff0000", // رنگ ارور در لایت مود
          dark: "#ff4d4d", // رنگ ارور در دارک مود
        },
        bgColor: {
          DEFAULT: "#FBFAFA", // پس‌زمینه لایت مود
          dark: "#181818", // پس‌زمینه دارک مود
        },
        boxColor: {
          DEFAULT: "#FFFFFF", // رنگ جعبه‌ها در لایت مود
          dark: "#2c2c2c", // رنگ جعبه‌ها در دارک مود
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
