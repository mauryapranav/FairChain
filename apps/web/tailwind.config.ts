import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1440px' },
    },
    extend: {
      fontFamily: {
        // Paper & Ink fonts from fairchain-frontend-code
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['DM Sans',       'system-ui', 'sans-serif'],
        sans:    ['DM Sans',       'system-ui', 'sans-serif'],
        mono:    ['ui-monospace',  'monospace'],
      },
      colors: {
        // Paper & Ink palette (mirrors CSS vars)
        background: 'hsl(42 33% 96%)',
        foreground: 'hsl(0 0% 8%)',
        paper: {
          DEFAULT: 'hsl(42 33% 96%)',
          2:       'hsl(38 24% 91%)',
        },
        ink: {
          DEFAULT: 'hsl(0 0% 5%)',
          soft:    'hsl(0 0% 18%)',
        },
        border: 'hsl(38 18% 84%)',
        input:  'hsl(38 18% 84%)',
        ring:   'hsl(0 0% 8%)',

        primary: {
          DEFAULT:    'hsl(0 0% 5%)',
          foreground: 'hsl(42 33% 96%)',
        },
        secondary: {
          DEFAULT:    'hsl(38 24% 91%)',
          foreground: 'hsl(0 0% 8%)',
        },
        muted: {
          DEFAULT:    'hsl(38 24% 91%)',
          foreground: 'hsl(0 0% 38%)',
        },
        popover: {
          DEFAULT:    'hsl(42 33% 98%)',
          foreground: 'hsl(0 0% 8%)',
        },
        card: {
          DEFAULT:    'hsl(42 33% 96%)',
          foreground: 'hsl(0 0% 8%)',
        },

        // FairChain branded forest green (replaces teal #00E5A0)
        accent: {
          DEFAULT: '#2C7A4E',
          50:  '#EAF5EF',
          100: '#C5E5D3',
          200: '#9ED4B5',
          300: '#72C296',
          400: '#4DAF79',
          500: '#2C7A4E',
          600: '#226040',
          700: '#194830',
          800: '#103021',
          900: '#081811',
        },

        // Legacy navy kept for any remaining dark surfaces
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
        surface: '#F5F3EE', // becomes paper in light mode
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-glow':       'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(44,122,78,0.10), transparent)',
        'gradient-paper':  'radial-gradient(1200px 600px at 20% 0%, hsl(38 30% 88% / 0.6), transparent 60%), radial-gradient(900px 500px at 100% 100%, hsl(38 25% 84% / 0.5), transparent 60%)',
      },
      boxShadow: {
        soft:         '0 1px 2px hsl(0 0% 0% / 0.04), 0 8px 24px hsl(0 0% 0% / 0.05)',
        elevated:     '0 2px 6px hsl(0 0% 0% / 0.06), 0 24px 60px hsl(0 0% 0% / 0.10)',
        card:         '0 1px 3px hsl(0 0% 0% / 0.06), 0 8px 24px hsl(0 0% 0% / 0.05)',
        'card-hover': '0 4px 12px hsl(0 0% 0% / 0.10), 0 0 0 1px hsl(38 18% 72%)',
        glow:         '0 0 20px rgba(44, 122, 78, 0.25)',
      },
      borderRadius: {
        xl2: '1rem',
        xl3: '1.5rem',
        lg:  'var(--radius, 1rem)',
        md:  'calc(var(--radius, 1rem) - 4px)',
        sm:  'calc(var(--radius, 1rem) - 8px)',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'pulse-accent':  'pulseAccent 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'accordion-down':'accordion-down 0.2s ease-out',
        'accordion-up':  'accordion-up 0.2s ease-out',
        'marquee':       'marquee 40s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseAccent: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
