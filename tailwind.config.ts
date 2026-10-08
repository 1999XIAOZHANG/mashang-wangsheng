import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b0a08",
          900: "#12100d",
          800: "#1a1713",
          700: "#26221c",
          600: "#362f26",
        },
        candle: {
          DEFAULT: "#e8912d",
          bright: "#ffb84d",
          dim: "#8f5a1d",
        },
        buddha: {
          DEFAULT: "#c9a227",
          bright: "#e6c86e",
        },
        stele: {
          DEFAULT: "#8a857c",
          light: "#b5b0a6",
        },
        seal: "#a63a2b",
        ghost: "#7ec8a9",
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', "STSong", "SimSun", "serif"],
        kai: ['"Kaiti SC"', "STKaiti", "KaiTi", "楷体", "serif"],
        mono: ['"Cascadia Code"', '"JetBrains Mono"', "Consolas", '"Courier New"', "monospace"],
      },
      boxShadow: {
        candle: "0 0 24px rgba(232, 145, 45, 0.35), 0 0 64px rgba(232, 145, 45, 0.12)",
        gold: "0 0 18px rgba(201, 162, 39, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
