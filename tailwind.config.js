/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#faf0f2',
          100: '#f3dde1',
          200: '#e2b3bd',
          300: '#c9788a',
          400: '#a3334d',
          500: '#800020',
          600: '#660019',
          700: '#4d0013',
          800: '#33000d',
          900: '#1a0006',
        },
        gold: {
          50: '#fefbe8',
          100: '#fef6c3',
          200: '#fdea8d',
          300: '#fcd75a',
          400: '#f7c331',
          500: '#eaa916',
          600: '#c8850f',
          700: '#a1650f',
        },
        ink: {
          900: '#0b0b0c',
          800: '#161617',
          700: '#232324',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
