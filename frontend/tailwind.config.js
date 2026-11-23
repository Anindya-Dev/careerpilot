/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        neo: {
          bg: '#FDFBF7',
          black: '#000000',
          white: '#FFFFFF',
          yellow: '#FFDE59',
          green: '#70E000',
          mint: '#52B788',
          cyan: '#38B6FF',
          pink: '#FF70A6',
          orange: '#FF9900',
          purple: '#B388FF',
          cream: '#FFF9E6',
          border: '#000000',
        }
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #000000',
        'neo': '4px 4px 0px 0px #000000',
        'neo-lg': '6px 6px 0px 0px #000000',
        'neo-xl': '8px 8px 0px 0px #000000',
      }
    },
  },
  plugins: [],
}
