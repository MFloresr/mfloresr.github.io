import { routing, type Idioma } from "@/i18n/routing";

/**
 * Datos del sitio. La URL base sale de SITE_URL para poder pasar a un dominio
 * propio (p. ej. https://marioflores.dev) cambiando solo esa variable.
 */
export const SITE_URL = (process.env.SITE_URL ?? "https://marioflores.vercel.app").replace(/\/$/, "");

export const NOMBRE = "Mario Flores";

/**
 * Datos de contacto públicos. null = pendiente de que Mario los confirme:
 * se muestra como "pendiente" y no se puede publicar así (fase de calidad).
 */
export const CONTACTO = {
  email: null as string | null,
  linkedin: null as string | null,
  github: null as string | null, // propuesta: https://github.com/MFloresr (por confirmar)
};

/** Secciones de la web (mismo slug en todos los idiomas). */
export const SECCIONES = ["", "/projects", "/about", "/technologies", "/blog", "/contact"] as const;
export type Seccion = (typeof SECCIONES)[number];

/** Proyectos publicados (el contenido llega en la fase 2). */
export const PROYECTOS = ["mi-jornada", "sudokus", "agroclima-consultores"] as const;

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
