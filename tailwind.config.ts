import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta EDS (Espacio Design System) — inspirada en el logo
        coral: {
          DEFAULT: "#F46B6B",
          soft: "#FDECEC",
          dark: "#DA5252",
        },
        lavanda: {
          DEFAULT: "#9C6ADE",
          soft: "#F1EAFB",
          dark: "#7E4FC0",
        },
        naranja: {
          DEFAULT: "#F6A04D",
          soft: "#FEF1E2",
        },
        verde: {
          DEFAULT: "#4FAFA8",
          soft: "#E9F6F2",
          dark: "#357F79",
        },
        crema: "#FCFAF8",
        tinta: {
          DEFAULT: "#262626",
          soft: "#757575",
          faint: "#A8A29A",
        },
        noche: "#171717",
        panel: {
          DEFAULT: "#2E2B52",
          soft: "#39355F",
          deep: "#25234A",
        },
        // Colores por disciplina — variaciones tonales de la paleta principal,
        // nunca colores saturados fuera de familia.
        disciplina: {
          psicologia: "#9C6ADE",
          educacion: "#4D9DE0",
          nutricion: "#6FBE8F",
          fonoaudiologia: "#F6A04D",
          "terapia-ocupacional": "#F46B6B",
          kinesiologia: "#4FAFA8",
          "acompanamiento-infantil": "#E0A9E0",
          osteopatia: "#C08A5C",
          psicopedagogia: "#E08A9B",
        },
      },
      fontFamily: {
        display: ["'Manrope'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
      backgroundImage: {
        "gradiente-marca": "linear-gradient(135deg, #F46B6B 0%, #9C6ADE 100%)",
        "gradiente-suave": "linear-gradient(135deg, #FDECEC 0%, #F1EAFB 100%)",
        "gradiente-panel": "linear-gradient(180deg, #322D5C 0%, #262048 100%)",
        "gradiente-asistente": "linear-gradient(135deg, #FDECEC 0%, #FBE4EE 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(38, 38, 38, 0.06)",
        "glass-lg": "0 20px 60px rgba(38, 38, 38, 0.10)",
        "glow-coral": "0 8px 24px rgba(244, 107, 107, 0.35)",
      },
      backdropBlur: {
        glass: "20px",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
    },
  },
  plugins: [],
};
export default config;
