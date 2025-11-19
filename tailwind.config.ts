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
        background: "var(--background)",
        foreground: "var(--foreground)",
        medieval: {
          gold: '#D4AF37',
          crimson: '#DC143C',
          stone: '#708090',
          bronze: '#CD7F32',
        }
      },
      fontFamily: {
        medieval: ['Georgia', 'serif'],
      }
    },
  },
  plugins: [],
};
export default config;
