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
        // Proxy Brand Colors - Monochrome
        primary: "#FFFFFF", // White
        secondary: "#E5E7EB", // Light gray
        accent: "#9CA3AF", // Medium gray
        dark: "#18181B", // Almost black
        darker: "#09090B", // Pure black
        light: "#F9FAFB", // Off-white
      },
    },
  },
  plugins: [],
};
export default config;

