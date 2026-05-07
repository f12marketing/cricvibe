/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#06090F',
        backgroundAlt: '#0C1220',
        primary: '#00E676',
        primaryDim: '#00C853',
        secondary: '#FFD740',
        secondaryDim: '#FFC400',
        accent: '#448AFF',
        accentDim: '#2979FF',
        surface: 'rgba(255, 255, 255, 0.04)',
        surfaceHover: 'rgba(255, 255, 255, 0.08)',
        surfaceActive: 'rgba(255, 255, 255, 0.12)',
        border: 'rgba(255, 255, 255, 0.06)',
        borderHover: 'rgba(255, 255, 255, 0.12)',
        danger: '#FF5252',
        dangerDim: '#FF1744',
        textPrimary: '#F0F0F5',
        textSecondary: '#8B92A5',
        textMuted: '#4A5068',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(0, 230, 118, 0.15)',
        'glow-md': '0 0 30px -5px rgba(0, 230, 118, 0.25)',
        'glow-lg': '0 0 50px -10px rgba(0, 230, 118, 0.35)',
        'glow-secondary': '0 0 30px -5px rgba(255, 215, 64, 0.25)',
        'glow-accent': '0 0 30px -5px rgba(68, 138, 255, 0.25)',
        'glow-danger': '0 0 20px -5px rgba(255, 82, 82, 0.3)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
