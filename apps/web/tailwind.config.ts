import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        navy: {
          DEFAULT: '#0A0F1E',
          50:  '#E8EAF0',
          100: '#C5CBD9',
          200: '#9AA5BB',
          300: '#6F7F9D',
          400: '#4D6185',
          500: '#2B4370',
          600: '#1E2F52',
          700: '#141E36',
          800: '#0D1428',
          900: '#0A0F1E',
        },
        surface: '#111827',
        accent: {
          DEFAULT: '#00E5A0',
          50:  '#E5FFF7',
          100: '#B3FFEB',
          200: '#80FFDD',
          300: '#4DFFCF',
          400: '#1AFFC0',
          500: '#00E5A0',
          600: '#00B87F',
          700: '#008B60',
          800: '#005E41',
          900: '#003121',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,229,160,0.15), transparent)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-accent': 'pulseAccent 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseAccent: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,160,0.25)',
        glow: '0 0 20px rgba(0,229,160,0.35)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;
