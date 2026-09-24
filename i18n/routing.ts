import { defineRouting } from "next-intl/routing";

/**
 * Idiomas publicados: castellano, inglés, catalán y francés. Para añadir otro basta con
 * incluir su código aquí y crear messages/<código>.json (y su contenido): las rutas no cambian.
 */
export const routing = defineRouting({
  locales: ["es", "en", "ca", "fr"],
  defaultLocale: "es",
  // Siempre con prefijo (/es/..., /en/...); en "/" se elige según el navegador
  localePrefix: "always",
});

export type Idioma = (typeof routing.locales)[number];
