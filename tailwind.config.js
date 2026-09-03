/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#08070B',
        panel: '#121017',
        panel2: '#1A1720',
        line: '#26212E',
        violet: {
          DEFAULT: '#7C3AED',
          bright: '#9D5CFF',
          dim: '#4C1D95',
        },
        bone: '#F4F1F7',
        mute: '#9992A8',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(124,58,237,0.35), 0 8px 30px rgba(124,58,237,0.15)',
      },
    },
  },
  plugins: [],
};
