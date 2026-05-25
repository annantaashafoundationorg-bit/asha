import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080e1c',
        panel: '#0f1a2e',
        panelHover: '#152240',
        line: '#1e3060',
        text: '#e6eaff',
        muted: '#8a9cc8',
        accent: '#4f7dff',
        accentGlow: '#3a5fd6',
        success: '#34d399',
        warning: '#fbbf24',
        danger: '#f87171',
        aasha: '#ff7043',
        aashaLight: '#ff9a76',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 0 0 1px #1e3060, 0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(79,125,255,0.15)',
        aasha: '0 0 20px rgba(255,112,67,0.2)',
      },
    },
  },
  plugins: [],
}
export default config
