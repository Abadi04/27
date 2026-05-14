/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#111827",
        muted: "#667085",
        line: "#E5E7EB",
        canvas: "#F7F8FA",
        ios: "#F2F2F7",
        action: "#0A7AFF",
        xblue: "#1D9BF0",
        success: "#22A05D",
        premium: "#FF2D55",
      },
      boxShadow: {
        modal: "0 24px 70px rgba(17, 24, 39, 0.18)",
        panel: "0 1px 2px rgba(16, 24, 40, 0.06)",
        strong: "0 26px 70px rgba(16, 18, 20, 0.24)",
      },
    },
  },
  plugins: [],
};
