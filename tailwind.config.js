/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#04070f',
        navy: {
          950: '#050a15',
          900: '#070f1f',
          850: '#0a1526',
          800: '#0d1b30',
          700: '#122540',
        },
        teal: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        gold: {
          200: '#f7e0b0',
          300: '#f2cd8a',
          400: '#e8b45c',
          500: '#d19a3f',
        },
        ink: '#eef3fb',
        muted: '#9aabc6',
      },
      fontFamily: {
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 30px 80px -40px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        lift: '0 26px 60px -24px rgba(0, 0, 0, 0.85)',
        glow: '0 0 0 1px rgba(94, 234, 212, 0.25), 0 24px 70px -30px rgba(45, 212, 191, 0.6)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        floaty: 'floaty 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
