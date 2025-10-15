import type { Config } from "tailwindcss";

/**
 * Tailwind CSS Configuration
 *
 * This configuration includes DaisyUI for theme management.
 * Light and dark themes are configured below.
 */
export default {
    darkMode: ["class", '[data-theme="dark"]'],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			// Main theme color - change this to update the entire app's color scheme
  			primary: "#8b5cf6", // Main brand color
  			"primary-light": "#a78bfa", // For hover states
  			"primary-dark": "#7c3aed", // For active states

  			// Secondary colors for backgrounds and text
  			secondary: "#f8fafc", // Light backgrounds
  			"secondary-dark": "#334155", // Dark backgrounds

  			// Legacy CSS variables for backward compatibility
  			background: 'var(--background)',
  			foreground: 'var(--foreground)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		// Custom spacing for consistent layout
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  		},
  		// Custom container sizes
  		maxWidth: {
  			'xs': '20rem',
  			'sm': '24rem',
  			'md': '28rem',
  			'lg': '32rem',
  			'xl': '36rem',
  			'2xl': '42rem',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
  },
} satisfies Config;
