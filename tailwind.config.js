/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        "app-bg": "var(--app-bg)",
        "app-sidebar": "var(--app-sidebar)",
        "app-text": "var(--app-text)",
        "app-accent": "var(--app-accent)",
        "app-break": "var(--app-break)",
        "app-session": "var(--app-session)",
      },
      fontFamily: {
        digital: ["digital-clock", "monospace"],
      },
    },
  },
  plugins: [],
};
