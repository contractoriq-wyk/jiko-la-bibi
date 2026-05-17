/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — taken from the official Jiko La Bibi JJJ menu design
        navy: {
          DEFAULT: "#0a1f44",
          deep: "#06152f",
          light: "#13315c",
          soft: "#1c4076",
        },
        gold: {
          DEFAULT: "#d4af37",
          light: "#e8c860",
          deep: "#b8941f",
        },
        cream: {
          DEFAULT: "#fbf4e3",
          deep: "#f3e6c8",
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: "0 8px 28px -10px rgba(6,21,47,0.35)",
        gold: "0 6px 20px -6px rgba(212,175,55,0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease both",
        "slide-in": "slide-in 0.3s ease both",
      },
    },
  },
  plugins: [],
};
