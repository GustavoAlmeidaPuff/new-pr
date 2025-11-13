import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#050B12",
          elevated: "#0E1621",
          card: "#111C2B",
          muted: "#162235",
        },
        primary: {
          DEFAULT: "#09C3F7",
          foreground: "#021520",
        },
        metric: {
          load: "#35D0FF",
          reps: "#2CD889",
          volume: "#7B5CFF",
        },
        success: {
          DEFAULT: "#2CD889",
          foreground: "#041914",
        },
        warning: {
          DEFAULT: "#F5C543",
          foreground: "#1F1600",
        },
        danger: {
          DEFAULT: "#F87171",
          foreground: "#210505",
        },
        text: {
          DEFAULT: "#E5F4FF",
          muted: "#9FB5CA",
          subtle: "#6E8397",
        },
        border: "#1E2B3E",
        outline: "#173B50",
      },
      fontFamily: {
        sans: ["'Inter Variable'", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "20px",
      },
      boxShadow: {
        card: "0px 12px 24px rgba(1, 11, 27, 0.45)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      },
    },
  },
  plugins: [forms],
};

