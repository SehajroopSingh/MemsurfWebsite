/** @type {import('tailwindcss').Config} */
// Force config reload
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        app: {
          canvas: 'var(--app-canvas)',
          surface: 'var(--app-surface)',
          surfaceElevated: 'var(--app-surface-elevated)',
          border: 'var(--app-border)',
          text: 'var(--app-text)',
          textMuted: 'var(--app-text-muted)',
          mint: 'var(--app-mint)',
          softBlue: 'var(--app-soft-blue)',
          violet: 'var(--app-violet)',
          lavender: 'var(--app-lavender)',
          mintHi: 'var(--app-mint-highlight)',
          blueHi: 'var(--app-blue-highlight)',
          lavenderHi: 'var(--app-lavender-highlight)',
          mintDark: 'var(--app-mint-dark)',
          blueDark: 'var(--app-blue-shadow)',
          periwinkle: 'var(--app-periwinkle)',
          mintBright: 'var(--app-mint-bright)',
          blueBright: 'var(--app-blue-bright)',
          lilac: 'var(--app-lilac)',
        },
      },
      animation: {
        scan: 'scan 3s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}

