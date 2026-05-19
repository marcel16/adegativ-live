/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#fef3f2', 100: '#fee4e2', 200: '#ffcdc9', 300: '#fea9a3', 400: '#fb7d74', 500: '#f05245', 600: '#e0352b', 700: '#bc271e', 800: '#9b231c', 900: '#80241e', 950: '#460d0a' },
        adega: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' },
      },
    },
  },
  plugins: [],
};
