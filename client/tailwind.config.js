/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kla: {
          purple: '#3D0A7F',
          'purple-dark': '#26064F',
          'purple-light': '#5B2A9B',
          blue: '#3B82C8',
          'blue-dark': '#2C68A6',
          sky: '#48A9E0',
          ink: '#050507',
          slate: '#4B4B57',
          mist: '#F5F5F7',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', '"Segoe UI"', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      keyframes: {
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'none' } },
      },
      animation: { 'fade-up': 'fadeUp 0.6s ease-out both' },
    },
  },
  plugins: [],
};
