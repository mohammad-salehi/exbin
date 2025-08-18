import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2fa2dc", // رنگ اصلی برند
        },
        titleText: {
          DEFAULT: "#606060", // رنگ متن عمومی
        },
      },
      fontFamily: {
        iranSans: ["IRANSansXFaNum", "sans-serif"], // اضافه کردن فونت
      },
    },
  },
  presets: [require("@heathmont/moon-themes")],
};

export default config;