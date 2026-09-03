/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        /* 纸卷 · 印记 — 基础色板 */
        paper: {
          50: '#FAF7F1',
          100: '#F4EEE3',
          200: '#EAE2D3',
        },
        ink: {
          900: '#22303E',
          700: '#3D4C5C',
          500: '#6E7B88',
          300: '#A9B2BC',
        },
        line: '#E3DCCB',
        primary: {
          DEFAULT: '#2E5A87',
          deep: '#234668',
          foreground: '#FAF7F1',
        },
        seal: {
          DEFAULT: '#C05A3E',
          soft: '#F7E5DE',
          foreground: '#FAF7F1',
        },
        success: {
          DEFAULT: '#5E8C61',
          soft: '#E6EFE5',
          foreground: '#FAF7F1',
        },
        warning: {
          DEFAULT: '#C99A3C',
          soft: '#F8EFDB',
          foreground: '#3D4C5C',
        },
        danger: {
          DEFAULT: '#B0543F',
          soft: '#F6E4DF',
          foreground: '#FAF7F1',
        },
        /* 七大模块主题色 */
        module: {
          deyu: '#7A5C8E',
          zhiyu: '#2E5A87',
          tiyu: '#5E8C61',
          keyan: '#8A6D3B',
          zuzhi: '#C08051',
          laodong: '#4F8A8B',
          meiyu: '#B06B7D',
        },
        /* shadcn 兼容令牌 */
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#22303E',
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '1.15', fontWeight: '900' }],
        'display-lg': ['40px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-md': ['28px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-sm': ['20px', { lineHeight: '1.4', fontWeight: '700' }],
        'body-lg': ['17px', { lineHeight: '1.75', fontWeight: '400' }],
        body: ['15px', { lineHeight: '1.7', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '1.6', fontWeight: '400' }],
        score: ['24px', { lineHeight: '1.2', fontWeight: '600' }],
      },
      letterSpacing: {
        title: '0.02em',
        'title-lg': '0.04em',
        mono: '0.12em',
      },
      maxWidth: {
        marketing: '1200px',
        wizard: '760px',
        export: '1080px',
      },
      borderRadius: {
        xl: "16px",
        lg: "14px",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: '0 1px 2px rgba(34,48,62,.05), 0 4px 16px rgba(34,48,62,.06)',
        'card-hover': '0 2px 4px rgba(34,48,62,.06), 0 12px 32px rgba(34,48,62,.10)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'pop': 'cubic-bezier(0.34, 1.4, 0.64, 1)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "stamp-shake": {
          "0%,100%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(-1.5px)" },
          "75%": { transform: "translateY(1.5px)" },
        },
        "breath": {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "stamp-shake": "stamp-shake 120ms ease-in-out",
        "breath": "breath 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
