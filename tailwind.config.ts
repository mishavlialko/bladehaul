import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B0D11',
        dark: '#14181F',
        steel: '#6B7689',
        text: '#1A1A1A',
        'text-dim': '#555B67',
        'text-faint': '#8A95A8',
        orange: {
          DEFAULT: '#EA6A11',
          dark: '#B75A1D',
          bg: '#FFF1E5',
        },
        line: '#E1E4E8',
        'line-soft': '#F1F3F5',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter-tight)', 'var(--font-inter)', 'sans-serif'],
      },
      transitionTimingFunction: {
        'out-quart': 'cubic-bezier(0.23, 1, 0.32, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
