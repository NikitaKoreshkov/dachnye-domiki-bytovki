/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        bp: '920px',
      },
      colors: {
        // Natural wood colors
        wood: {
          dark: '#5D4E37',
          medium: '#8B6F47',
          light: '#A67C52',
        },
        forest: {
          green: '#4A6B57',
          sage: '#6B8E6B',
        },
        natural: {
          cream: '#F5F1E8',
          beige: '#E8DCC6',
          brown: '#6D5D4A',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
