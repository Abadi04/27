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
          "Inter",
          "Geist",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        ink: "#FFFFFF",
        muted: "#A7A7B8",
        line: "rgba(255,255,255,0.1)",
        canvas: "#0A0A0F",
        ios: "#0D0D1A",
        action: "#7B61FF",
        xblue: "#00D4FF",
        success: "#00D4FF",
        premium: "#FF4D6D",
      },
      boxShadow: {
        modal: "0 28px 90px rgba(0, 0, 0, 0.58)",
        panel: "0 18px 50px rgba(0, 0, 0, 0.28)",
        strong: "0 28px 90px rgba(0, 0, 0, 0.46)",
      },
    },
  },
  plugins: [],
};
