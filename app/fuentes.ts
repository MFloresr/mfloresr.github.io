import { Exo_2, JetBrains_Mono, Orbitron } from "next/font/google";

// Fuentes descargadas al compilar y servidas desde el propio sitio (sin peticiones a Google)
export const orbitron = Orbitron({ subsets: ["latin"], variable: "--fuente-display", display: "swap" });
export const exo2 = Exo_2({ subsets: ["latin"], variable: "--fuente-sans", display: "swap" });
// Consola del inicio y código dentro de los artículos
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--fuente-codigo", display: "swap" });
