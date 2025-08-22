/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'spin-slow': 'spin 20s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'gradient': 'gradient 8s ease-in-out infinite',
        'gradient-shift': 'gradientShift 25s ease-in-out infinite',
        'gradient-wave': 'gradientWave 18s ease-in-out infinite',
        'shimmer': 'shimmer 12s ease-in-out infinite',
        'slow-pulse': 'slowPulse 3s ease-in-out infinite',
        'gentle-bounce': 'gentleBounce 4s ease-in-out infinite',
        'fade-glow': 'fadeGlow 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 1.2s ease-out',
        'drift-1': 'drift1 8s ease-in-out infinite',
        'drift-2': 'drift2 10s ease-in-out infinite',
        'drift-3': 'drift3 7s ease-in-out infinite',
        'drift-4': 'drift4 9s ease-in-out infinite',
        'drift-5': 'drift5 6s ease-in-out infinite',
        'drift-6': 'drift6 8s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        gradient: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -15px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 10px) scale(0.95)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-25px, 20px) scale(1.1)' },
          '66%': { transform: 'translate(30px, -25px) scale(0.9)' },
        },
        driftGentle: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '25%': { transform: 'translate(15px, -20px) rotate(5deg)' },
          '50%': { transform: 'translate(-10px, -10px) rotate(-3deg)' },
          '75%': { transform: 'translate(-20px, 15px) rotate(7deg)' },
        },
        sway: {
          '0%, 100%': { transform: 'translateX(0px) scale(1)' },
          '50%': { transform: 'translateX(25px) scale(1.08)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        gradientShift: {
          '0%, 100%': { 
            backgroundImage: 'linear-gradient(45deg, rgb(100 116 139), rgb(147 51 234), rgb(79 70 229))'
          },
          '33%': { 
            backgroundImage: 'linear-gradient(135deg, rgb(79 70 229), rgb(139 92 246), rgb(168 85 247))'
          },
          '66%': { 
            backgroundImage: 'linear-gradient(225deg, rgb(139 92 246), rgb(147 51 234), rgb(100 116 139))'
          },
        },
        gradientWave: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.15' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        drift1: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg) scale(1)' },
          '25%': { transform: 'translate(80px, -60px) rotate(90deg) scale(1.2)' },
          '50%': { transform: 'translate(-60px, -80px) rotate(180deg) scale(0.8)' },
          '75%': { transform: 'translate(-80px, 60px) rotate(270deg) scale(1.1)' },
        },
        drift2: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg) scale(1)' },
          '33%': { transform: 'translate(-100px, 80px) rotate(120deg) scale(1.3)' },
          '66%': { transform: 'translate(90px, -70px) rotate(240deg) scale(0.7)' },
        },
        drift3: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '20%': { transform: 'translate(70px, 50px) rotate(72deg)' },
          '40%': { transform: 'translate(-50px, 90px) rotate(144deg)' },
          '60%': { transform: 'translate(-90px, -40px) rotate(216deg)' },
          '80%': { transform: 'translate(40px, -80px) rotate(288deg)' },
        },
        drift4: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '30%': { transform: 'translate(90px, -70px) scale(1.4)' },
          '70%': { transform: 'translate(-70px, 100px) scale(0.6)' },
        },
        drift5: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg)' },
          '40%': { transform: 'translate(-80px, -60px) rotate(144deg)' },
          '80%': { transform: 'translate(60px, 80px) rotate(288deg)' },
        },
        drift6: {
          '0%, 100%': { transform: 'translate(0px, 0px) rotate(0deg) scale(1)' },
          '25%': { transform: 'translate(50px, -90px) rotate(90deg) scale(1.25)' },
          '50%': { transform: 'translate(-100px, 30px) rotate(180deg) scale(0.75)' },
          '75%': { transform: 'translate(70px, 70px) rotate(270deg) scale(1.15)' },
        },
        slowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        gentleBounce: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.02)' },
        },
        fadeGlow: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}