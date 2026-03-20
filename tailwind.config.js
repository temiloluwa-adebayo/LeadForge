/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          400: '#4ade80',
          500: '#22c55e',
          neon: '#00e676',
        },
        slate: {
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
        }
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui'],
        display: ['var(--font-bricolage)', 'system-ui'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-in': 'slideIn 0.4s ease forwards',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 }
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-12px)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,230,118,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(0,230,118,0)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      boxShadow: {
        'green-sm': '0 0 0 1px rgba(0,230,118,0.3)',
        'green-md': '0 0 20px rgba(0,230,118,0.15)',
        'green-lg': '0 0 40px rgba(0,230,118,0.2)',
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
