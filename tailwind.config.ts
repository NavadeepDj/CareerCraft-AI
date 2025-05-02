import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
            // Updated based on globals.css B&W theme
  			background: 'hsl(var(--background))', // White / Near Black
  			foreground: 'hsl(var(--foreground))', // Near Black / White
  			card: {
  				DEFAULT: 'hsl(var(--card))', // White / Near Black
  				foreground: 'hsl(var(--card-foreground))' // Near Black / White
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))', // White / Near Black
  				foreground: 'hsl(var(--popover-foreground))' // Near Black / White
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))', // Black / White
  				foreground: 'hsl(var(--primary-foreground))' // White / Black
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))', // Light Gray / Dark Gray
  				foreground: 'hsl(var(--secondary-foreground))' // Black / White
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))', // Lighter Gray / Dark Gray
  				foreground: 'hsl(var(--muted-foreground))' // Mid Gray / Lighter Gray
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))', // Black / White
  				foreground: 'hsl(var(--accent-foreground))' // White / Black
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))', // Black / White
  				foreground: 'hsl(var(--destructive-foreground))' // White / Black
  			},
  			border: 'hsl(var(--border))', // Gray / Dark Gray
  			input: 'hsl(var(--input))', // Gray / Dark Gray
  			ring: 'hsl(var(--ring))', // Black / White
  			chart: {
  				'1': 'hsl(var(--chart-1))', // Black / White
  				'2': 'hsl(var(--chart-2))', // Dark Gray / Very Light Gray
  				'3': 'hsl(var(--chart-3))', // Mid Gray / Light Gray
  				'4': 'hsl(var(--chart-4))', // Light Gray / Mid Gray
  				'5': 'hsl(var(--chart-5))' // Very Light Gray / Dark Gray
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))', // Slightly off-white / Near Black
  				foreground: 'hsl(var(--sidebar-foreground))', // Near Black / White
  				primary: 'hsl(var(--sidebar-primary))', // Black / White
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))', // White / Black
  				accent: 'hsl(var(--sidebar-accent))', // Light Gray / Dark Gray
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))', // Near Black / White
  				border: 'hsl(var(--sidebar-border))', // Gray / Dark Gray
  				ring: 'hsl(var(--sidebar-ring))' // Black / White
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [
      require("tailwindcss-animate"),
      require('@tailwindcss/typography'), // Add the typography plugin
    ],
} satisfies Config;
