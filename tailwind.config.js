/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-green': {
          400: '#39ff14',
          500: '#00ff41',
          600: '#00cc33',
        },
        'dark': {
          800: '#0a0a0a',
          900: '#050505',
        }
      },
      boxShadow: {
        'neon': '0 0 20px #00ff41',
        'neon-lg': '0 0 40px #00ff41',
      },
      animation: {
        'pulse-neon': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}