/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sbi: {
          indigo: '#23005A',
          'indigo-dark': '#1A0042',
          'indigo-light': '#340082',
          blue: '#0099DB',
          'blue-dark': '#0077B6',
          'blue-light': '#38B6FF',
          navy: '#0C2340',
          'navy-light': '#1E3A5F',
          yellow: '#FFD200',
          gold: '#E5A900',
          green: '#00875A',
          'green-light': '#E6F4EA',
          bg: '#F4F7FB',
          border: '#D1DCE8',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'sbi': '0 2px 8px rgba(12, 35, 64, 0.08)',
        'sbi-lg': '0 8px 24px rgba(12, 35, 64, 0.12)',
      }
    },
  },
  plugins: [],
}
