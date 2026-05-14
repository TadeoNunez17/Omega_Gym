import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface2)",
        },
        border: {
          DEFAULT: "var(--border)",
          2: "var(--border2)",
        },
        text: {
          DEFAULT: "var(--text)",
          2: "var(--text-2)",
          3: "var(--text-3)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dim: "var(--accent-dim)",
          text: "var(--accent-text)",
        },
        green: {
          DEFAULT: "var(--green)",
          bg: "var(--green-bg)",
          text: "var(--green-text)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          bg: "var(--amber-bg)",
          text: "var(--amber-text)",
        },
        red: {
          DEFAULT: "var(--red)",
          bg: "var(--red-bg)",
          text: "var(--red-text)",
        },
        gray: {
          bg: "var(--gray-bg)",
          text: "var(--gray-text)",
        },
        blue: {
          DEFAULT: "var(--blue)",
          bg: "var(--blue-bg)",
          text: "var(--blue-text)",
        },
        purple: {
          DEFAULT: "var(--purple)",
          bg: "var(--purple-bg)",
          text: "var(--purple-text)",
        },
        pink: {
          DEFAULT: "var(--pink)",
          bg: "var(--pink-bg)",
          text: "var(--pink-text)",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "ui-monospace", "monospace"],
      },
      spacing: {
        sidebar: "var(--sidebar-w)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
    },
  },
  plugins: [],
} satisfies Config;
