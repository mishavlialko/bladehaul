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
        // #68707E passes WCAG AA on paper (4.53:1) and white (4.99:1) while
        // staying visually muted. The old #8A95A8 failed at ~2.7:1.
        'text-faint': '#68707E',
        orange: {
          DEFAULT: '#EA6A11',
          dark: '#B75A1D',
          bg: '#FFF1E5',
        },
        line: '#E1E4E8',
        'line-soft': '#F1F3F5',
        // Matte unbleached documentation paper — Swiss Industrial Print
        // archetype. Used as the light "bookend" surface (Navbar + Footer)
        // in place of pure white. Off-white with a warm undertone.
        paper: '#F4F4F0',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: [
          'var(--font-big-shoulders)',
          'var(--font-inter)',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'var(--font-jetbrains-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
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
