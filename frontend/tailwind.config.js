/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        parchment: '#F5F1E8',
        accent: '#C9A227',
        muted: '#374151'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(17,24,39,0.08)'
      }
    }
  },
  plugins: []
};
