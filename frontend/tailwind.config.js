/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
          colors: {
            primary: "#8000d8",     // Indigo-600
            secondary: "#de264e",   // Rose-500
            accent: "#10B981",      // Emerald-500
            background: "#0d0d0d",  
            surface: "#FFFFFF",
            text: "#111827",        // Gray-900
          },
        },
      },
    plugins: [],
  }