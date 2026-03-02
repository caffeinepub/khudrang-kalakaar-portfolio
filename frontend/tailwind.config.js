/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* ── Semantic tokens (map to CSS vars) ── */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        /* ── Brand palette (direct OKLCH via CSS utilities) ── */
        terracotta: {
          DEFAULT: 'oklch(0.52 0.14 38)',
          light: 'oklch(0.65 0.12 38)',
          dark: 'oklch(0.40 0.14 38)',
          50: 'oklch(0.95 0.03 38)',
          100: 'oklch(0.90 0.06 38)',
          200: 'oklch(0.80 0.09 38)',
          300: 'oklch(0.70 0.11 38)',
          400: 'oklch(0.60 0.13 38)',
          500: 'oklch(0.52 0.14 38)',
          600: 'oklch(0.45 0.14 38)',
          700: 'oklch(0.38 0.13 38)',
          800: 'oklch(0.30 0.11 38)',
          900: 'oklch(0.22 0.08 38)',
        },
        gold: {
          DEFAULT: 'oklch(0.72 0.12 75)',
          light: 'oklch(0.82 0.10 75)',
          dark: 'oklch(0.58 0.13 75)',
          50: 'oklch(0.96 0.03 75)',
          100: 'oklch(0.92 0.05 75)',
          200: 'oklch(0.86 0.08 75)',
          300: 'oklch(0.80 0.10 75)',
          400: 'oklch(0.74 0.11 75)',
          500: 'oklch(0.68 0.12 75)',
          600: 'oklch(0.62 0.12 75)',
          700: 'oklch(0.55 0.11 75)',
          800: 'oklch(0.46 0.10 75)',
          900: 'oklch(0.36 0.08 75)',
        },
        cream: {
          DEFAULT: 'oklch(0.97 0.012 75)',
          dark: 'oklch(0.92 0.02 75)',
          darker: 'oklch(0.86 0.025 75)',
        },
        charcoal: {
          DEFAULT: 'oklch(0.18 0.025 50)',
          medium: 'oklch(0.35 0.025 50)',
          light: 'oklch(0.50 0.025 50)',
          lighter: 'oklch(0.65 0.025 50)',
        },
        'warm-border': 'oklch(0.82 0.03 70)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },
      boxShadow: {
        warm: '0 4px 24px oklch(0.52 0.14 38 / 0.12)',
        'warm-lg': '0 8px 40px oklch(0.52 0.14 38 / 0.18)',
        'warm-xl': '0 16px 60px oklch(0.52 0.14 38 / 0.22)',
        'warm-sm': '0 2px 12px oklch(0.52 0.14 38 / 0.08)',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.7s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
  ],
};
