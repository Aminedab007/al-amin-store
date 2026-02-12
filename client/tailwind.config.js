// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      container: { center: true, padding: "1rem", screens: { lg: "1100px", xl: "1200px" } },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3"
        }
      }
    }
  },
  plugins: []
};
