/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
      colors: {
        blue: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8accff',
          400: '#4eb2ff',
          500: '#2494ff',
          600: '#0974ff',
          700: '#0059e6',
          800: '#0047b8',
          900: '#003c96',
        },
        green: {
          50: '#ecfdf4',
          100: '#d2f9e4',
          200: '#a8f1d0',
          300: '#68e4b3',
          400: '#2ecd8f',
          500: '#12b277',
          600: '#089361',
          700: '#097550',
          800: '#0b5c42',
          900: '#0a4b37',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 15px rgba(46, 205, 143, 0.1)',
      },
    },
  },
  plugins: [],
};