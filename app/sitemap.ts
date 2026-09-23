import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { PROYECTOS, SECCIONES, alternativas, urlAbsoluta } from "@/lib/sitio";

// Todas las páginas en cada idioma, con sus alternativas (hreflang)
export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = [...SECCIONES, ...PROYECTOS.map((slug) => `/projects/${slug}`)];
  return rutas.flatMap((ruta) =>
    routing.locales.map((idioma) => ({
      url: urlAbsoluta(idioma, ruta),
      alternates: { languages: alternativas(ruta) },
    })),
  );
}
