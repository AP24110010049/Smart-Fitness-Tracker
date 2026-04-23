/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#edfff7',
          100: '#d5ffee',
          200: '#aeffdd',
          300: '#70ffca',
          400: '#2bfcb0',
          500: '#00e896',
          600: '#00c47c',
          700: '#009b63',
          800: '#00784f',
          900: '#006242',
        },
        dark: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1a2235',
          600: '#232d42',
          500: '#2d3a52',
        },
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
