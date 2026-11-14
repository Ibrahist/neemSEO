import type { Config } from "tailwindcss";

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
        brand: {
          blue: '#1D4ED8',
          coral: '#FF6B4A',
          navy: '#0B1226',
          surface: '#0F1A36',
          card: '#132145',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
        heading: ['"IBM Plex Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
