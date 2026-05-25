/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050816',
        nightblue: '#0D132B',
        darkviolet: '#1B143A',
        neonpink: '#FF78C8',
        warmgold: '#FFD58A',
        moonglow: '#B9C9FF',
        text: {
          DEFAULT: '#F8F4FF',
          secondary: '#C7BEDA',
          muted: '#8E84A9',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Noto Naskh Arabic"', '"Amiri"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['Inter', '"Nunito Sans"', 'system-ui', 'sans-serif'],
        handwritten: ['"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(255,120,200,0.45)',
        glowSm: '0 0 20px rgba(255,120,200,0.35)',
      },
      backgroundImage: {
        heroGlow:
          'linear-gradient(135deg, #FF78C8 0%, #B9C9FF 45%, #FFD58A 100%)',
      },
    },
  },
  plugins: [],
};
