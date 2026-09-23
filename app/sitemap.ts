import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { listarArticulos, listarSlugsProyectos } from "@/lib/contenido/leer";
import { SECCIONES, alternativas, urlAbsoluta } from "@/lib/sitio";

// Todas las páginas en cada idioma, con sus alternativas (hreflang)
export default function sitemap(): MetadataRoute.Sitemap {
  const articulos = listarArticulos().filter((a) => Object.values(a.textos).every((x) => !x.datos.borrador));
  const etiquetas = new Set(articulos.flatMap((a) => Object.values(a.textos).flatMap((x) => x.datos.etiquetas)));
  const rutas = [
    ...SECCIONES,
    ...listarSlugsProyectos().map((slug) => `/projects/${slug}`),
    ...[...etiquetas].map((e) => `/blog/tag/${e}`),
  ];
  const paginas = rutas.flatMap((ruta) =>
    routing.locales.map((idioma) => ({
      url: urlAbsoluta(idioma, ruta),
      alternates: { languages: alternativas(ruta) },
    })),
  );
  // Artículos: solo en los idiomas en los que están escritos
  const entradas = articulos.flatMap((a) => {
    const ruta = `/blog/${a.slug}`;
    const idiomas = routing.locales.filter((i) => a.textos[i]);
    const languages = Object.fromEntries(idiomas.map((i) => [i, urlAbsoluta(i, ruta)]));
    return idiomas.map((idioma) => ({
      url: urlAbsoluta(idioma, ruta),
      lastModified: a.textos[idioma]!.datos.actualizado ?? a.textos[idioma]!.datos.fecha,
      alternates: { languages },
    }));
  });
  return [...paginas, ...entradas];
}
