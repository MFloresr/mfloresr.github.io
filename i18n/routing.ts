import { defineRouting } from "next-intl/routing";

/**
 * Idiomas publicados. Para añadir catalán o francés basta con incluir su código
 * aquí y crear messages/<código>.json (y su contenido): las rutas no cambian.
 * Previstos: "ca", "fr".
 */
export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // Siempre con prefijo (/es/..., /en/...); en "/" se elige según el navegador
  localePrefix: "always",
});

export type Idioma = (typeof routing.locales)[number];
