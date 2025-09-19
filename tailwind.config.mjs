/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Raleway', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        heading: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        gallery: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        earth: {
          50: '#faf8f6',
          100: '#f8f6f2',
          200: '#f0ebe3',
          300: '#e3d8c8',
          400: '#d4a574',
          500: '#b8935f',
          600: '#a0804f',
          700: '#866b42',
          800: '#6d5535',
          900: '#5a4629',
        },
        sage: {
          50: '#f6f8f6',
          100: '#e8f0e8',
          200: '#d1e1d1',
          300: '#a8b5a1',
          400: '#8fa086',
          500: '#758b6d',
          600: '#5e7158',
          700: '#4d5d47',
          800: '#3d4d39',
          900: '#2c3a2a',
        },
        forest: {
          50: '#f2f4f2',
          100: '#e0e6e0',
          200: '#c1ccc1',
          300: '#9bb09b',
          400: '#759375',
          500: '#5a785a',
          600: '#3d5a3d',
          700: '#345034',
          800: '#2c422c',
          900: '#253725',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}