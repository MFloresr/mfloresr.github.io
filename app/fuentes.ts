import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

// Fuentes descargadas al compilar y servidas desde el propio sitio (sin peticiones a Google)
export const geist = Geist({ subsets: ["latin"], variable: "--fuente-sans", display: "swap" });
export const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--fuente-mono", display: "swap" });
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--fuente-serif",
  display: "swap",
});
