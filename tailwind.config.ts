import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172230",
        mist: "#f7f9fc",
        line: "#e5eaf0",
        teal: "#2eb8a1",
        navy: "#142238",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(20, 34, 56, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
