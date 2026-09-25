import { routing, type Idioma } from "@/i18n/routing";

/**
 * Datos del sitio. La URL base sale de SITE_URL para poder pasar a un dominio
 * propio (p. ej. https://marioflores.dev) cambiando solo esa variable.
 */
export const SITE_URL = (process.env.SITE_URL ?? "https://mfloresr-portfolio.vercel.app").replace(/\/$/, "");

export const NOMBRE = "Mario Flores";

/** CV en PDF por idioma (se generan con `npm run cv`). */
export const CV_PDF: Record<Idioma, string> = {
  es: "/cv/mario-flores-cv-es.pdf",
  en: "/cv/mario-flores-cv-en.pdf",
  ca: "/cv/mario-flores-cv-ca.pdf",
  fr: "/cv/mario-flores-cv-fr.pdf",
};

/** Secciones de la web (mismo slug en todos los idiomas). */
export const SECCIONES = ["", "/projects", "/about", "/technologies", "/blog", "/ask", "/contact"] as const;
export type Seccion = (typeof SECCIONES)[number];

/** URL absoluta de una ruta en un idioma: urlAbsoluta("es", "/projects") */
export function urlAbsoluta(idioma: Idioma, ruta: string) {
  return `${SITE_URL}/${idioma}${ruta}`;
}

/** Alternativas por idioma (hreflang) para los metadatos de una ruta. */
export function alternativas(ruta: string) {
  const languages: Record<string, string> = {};
  for (const idioma of routing.locales) languages[idioma] = urlAbsoluta(idioma, ruta);
  languages["x-default"] = urlAbsoluta(routing.defaultLocale, ruta);
  return languages;
}
