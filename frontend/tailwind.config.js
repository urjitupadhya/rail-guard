/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: '#020617',
        surface: '#0F172A',
        surface2: '#1E293B',
        border: '#334155',
        muted: '#1A1E2F',
        accent: '#22C55E',
        warn: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        fg: '#F8FAFC',
        'fg-muted': '#94A3B8',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
        'flow': 'flow 2s linear infinite',
        'blink': 'blink 1s step-end infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        flow: {
          '0%': { opacity: '0.2', transform: 'translateX(-8px)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.2', transform: 'translateX(8px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(34,197,94,0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(34,197,94,0.7)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
