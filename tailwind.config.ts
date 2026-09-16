import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#2a1b17',
        panel: '#291d19',
        'panel-light': '#493027',
        'panel-lighter': '#673f30',
        primary: '#208e9d',
        'primary-hover': '#35b7c5',
        success: '#72b84b',
        danger: '#d9533f',
        warning: '#f4b942',
        'text-primary': '#fff5e2',
        'text-secondary': '#dfcbb2',
        'text-muted': '#b2957e',
        border: '#704838',
        'border-light': '#b67851',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'pitch-gradient': 'linear-gradient(180deg, #255c3a 0%, #34764a 50%, #255c3a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
        'progress': 'progress 1s ease-out forwards',
        'celebration': 'celebration 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(30px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        },
        celebration: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #3B82F6, 0 0 10px #3B82F6' },
          '100%': { boxShadow: '0 0 20px #3B82F6, 0 0 40px #3B82F6' },
        },
      },
      boxShadow: {
        'panel': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.3)',
        'glow-primary': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.6)',
      },
    },
  },
  plugins: [],
}

export default config