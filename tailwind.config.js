export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0d0f14', secondary: '#141720', card: '#1a1e2a', border: '#252a38' },
        accent: { green: '#39d98a', 'green-dim': '#2db870', 'green-glow': 'rgba(57,217,138,0.15)' },
        text: { primary: '#f0f2f7', secondary: '#8b93a7', muted: '#555d72' },
        risk: { high: '#ff4757', moderate: '#ffa502', low: '#39d98a' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Syne"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.3)',
        glow: '0 0 20px rgba(57,217,138,0.2)',
        'glow-sm': '0 0 10px rgba(57,217,138,0.15)',
      },
    },
  },
  plugins: [],
};
