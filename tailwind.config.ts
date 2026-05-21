import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        neon: {
          green: "#54ff9f",
          blue: "#44c7ff",
          purple: "#b088ff",
          coal: "#07080d",
          graphite: "#11131b"
        }
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)"
      },
      boxShadow: {
        glow: "0 0 32px rgba(84, 255, 159, 0.22)",
        "blue-glow": "0 0 36px rgba(68, 199, 255, 0.24)",
        "purple-glow": "0 0 36px rgba(176, 136, 255, 0.2)"
      },
      keyframes: {
        "caret-blink": {
          "0%, 46%": { opacity: "1" },
          "47%, 100%": { opacity: "0" }
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        },
        "float-line": {
          "0%": { transform: "translate3d(-8%, 0, 0)" },
          "50%": { transform: "translate3d(8%, -2%, 0)" },
          "100%": { transform: "translate3d(-8%, 0, 0)" }
        }
      },
      animation: {
        caret: "caret-blink 1s steps(1) infinite",
        "gradient-shift": "gradient-shift 12s ease infinite",
        "float-line": "float-line 16s ease-in-out infinite"
      }
    }
  },
  plugins: [typography]
};

export default config;
