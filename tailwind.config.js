/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark Medical Base
        'bg-primary': '#0B0F14',
        'bg-secondary': '#111820',
        'bg-tertiary': '#19202A',
        'bg-elevated': '#1D2630',
        'border-subtle': '#25303D',
        'border-active': '#2D8B7A',
        // Surgical Teal — Primary Accent
        'teal-400': '#4ECDC4',
        'teal-500': '#3BA99F',
        'teal-600': '#2D8B7A',
        'teal-300': '#7DDED6',
        'teal-glow': 'rgba(78, 205, 196, 0.15)',
        // Medical Functional Colours
        'alert-red': '#E84545',
        'alert-orange': '#F4A261',
        'alert-yellow': '#E9C46A',
        'success-green': '#2A9D8F',
        'info-blue': '#4A90D9',
        'purple-accent': '#9B5DE5',
        'pink-accent': '#F15BB5',
        // Text Colours
        'text-primary': '#E8ECF0',
        'text-secondary': '#94A3B8',
        'text-muted': '#5E6E80',
        'text-inverse': '#0B0F14',
        // Cytokine Cascade Colours
        'tnf-red': '#E84545',
        'il1-orange': '#F4A261',
        'il6-amber': '#E9C46A',
        'crp-coral': '#FF6B6B',
        'pct-pink': '#F15BB5',
        'il10-purple': '#9B5DE5',
        'hmgb1-violet': '#7B68EE',
        // shadcn compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
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
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
        heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
        'full': '9999px',
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.4), 0 0 16px rgba(78,205,196,0.08)',
        'modal': '0 16px 64px rgba(0,0,0,0.6)',
        'glow-teal': '0 0 20px rgba(78,205,196,0.15), 0 0 40px rgba(78,205,196,0.08)',
        'glow-red': '0 0 16px rgba(232,69,69,0.15)',
        'glow-orange': '0 0 16px rgba(244,162,97,0.12)',
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
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
        "pulse-badge": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-badge": "pulse-badge 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
