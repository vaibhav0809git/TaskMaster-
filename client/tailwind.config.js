/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#FFFFFF',
        surface: '#F8F8F7',
        'surface-2': '#F0EFED',
        'surface-3': '#E8E7E4',
        muted: '#9B9A97',
        ink: '#1A1A18',
        accent: '#2383E2',
        success: '#0F9D58',
        warning: '#F5A623',
        danger: '#E84040',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        badge: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.06)',
        drawer: '-4px 0 40px rgba(0,0,0,0.12)',
        modal: '0 8px 48px rgba(0,0,0,0.15)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.2s ease',
        'scale-in': 'scaleIn 0.15s ease',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
