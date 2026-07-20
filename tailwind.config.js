/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pop: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-6deg)' },
          '75%': { transform: 'rotate(6deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shine: {
          '0%': { transform: 'translateX(-150%) skewX(-15deg)' },
          '100%': { transform: 'translateX(350%) skewX(-15deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0.45)' },
          '50%': { boxShadow: '0 0 0 6px rgba(249, 115, 22, 0)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        pop: 'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        float: 'float 5s ease-in-out infinite',
        wiggle: 'wiggle 0.5s ease-in-out',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        shine: 'shine 0.9s ease-in-out both',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2.4s ease-in-out infinite',
        shake: 'shake 0.3s ease-in-out',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.32, 0.72, 0, 1) both',
        'slide-in-left': 'slide-in-left 0.35s cubic-bezier(0.32, 0.72, 0, 1) both',
        marquee: 'marquee 20s linear infinite',
        'rotate-slow': 'rotate-slow 14s linear infinite',
      },
      boxShadow: {
        'hard-sm': '3px 3px 0 0 rgba(0, 0, 0, 0.9)',
        hard: '5px 5px 0 0 rgba(0, 0, 0, 0.9)',
        'hard-orange': '5px 5px 0 0 rgba(249, 115, 22, 1)',
      },
    },
  },
  plugins: [],
};
