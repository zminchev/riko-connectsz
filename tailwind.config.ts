import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "dark-primary": "#053742",
        "dark-secondary": "#1B3B4F",
        "accent-primary": "#D4AF37",
        "accent-secondary": "#3DDC97",
        "text-primary": "#0B2B24",
        "text-secondary": "#A0A0A0",
        "button-primary": "#D4AF37",
        "button-secondary": "#3DDC97",
        "error-primary": "#D9534F",
        "success-primary": "#38B000",
        "current-user": "#1E5F74",
        "other-user": "#3A4750",
        "message-text": "#EAEAEA",
      },
      width: {
        "max-content": "max-content",
      },
      fontFamily: {
        fredoka: ["Fredoka", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};
export default config;
