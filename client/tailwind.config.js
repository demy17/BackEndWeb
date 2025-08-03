/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          neutral: {
            200: '#E5E5E5',
            600: '#6B7280',
          },
          primary: '#6B8E75',
        },
        keyframes: {
          slideIn: {
            '0%': { transform: 'translateX(100%)', opacity: 0 },
            '100%': { transform: 'translateX(0)', opacity: 1 },
          }
        },
        animation: {
          slideIn: 'slideIn 5s ease-out forwards',
        },
      },
    },
    plugins: [],
  }
  