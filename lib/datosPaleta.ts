import { getLocale, getTranslations } from "next-intl/server";
import type { DatosPaleta, ElementoPaleta } from "@/components/layout/Paleta";
import { routing } from "@/i18n/routing";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { nombreTecnologia } from "@/lib/contenido/idioma";
import { listarArticulos, listarProyectos, obtenerPerfil, obtenerTecnologias, textoArticulo } from "@/lib/contenido/leer";
import { CV_PDF } from "@/lib/sitio";

const PAGINAS = [
  ["/", "home"],
  ["/projects", "projects"],
  ["/about", "about"],
  ["/technologies", "technologies"],
  ["/blog", "blog"],
  ["/ask", "ask"],
  ["/contact", "contact"],
] as const;

/** Datos de la paleta de búsqueda y comandos, con los textos del idioma actual. */
export async function construirDatosPaleta(): Promise<DatosPaleta> {
  const idioma = (await getLocale()) as IdiomaContenido;
  const tn = await getTranslations("nav");
  const tf = await getTranslations("footer");
  const tp = await getTranslations("projects");
  const tg = await getTranslations("groups");
  const tl = await getTranslations("language");
  const t = await getTranslations("palette");
  const perfil = obtenerPerfil();

  const elementos: ElementoPaleta[] = [
    ...PAGINAS.map(([href, clave]) => ({ id: `p-${clave}`, grupo: "pages" as const, titulo: tn(clave), href })),
    { id: "p-legal", grupo: "pages", titulo: tf("legalPage"), href: "/legal" },
    { id: "p-privacy", grupo: "pages", titulo: tf("privacyPage"), href: "/privacy" },
    { id: "p-cookies", grupo: "pages", titulo: tf("cookiesPage"), href: "/cookies" },
    ...listarProyectos().map((p) => ({
      id: `pr-${p.slug}`,
      grupo: "projects" as const,
      titulo: (p.textos[idioma] ?? p.textos.es!).datos.titulo,
      detalle: `${tp(`status.${p.datos.estado}`)} · ${p.datos.anio}`,
      href: `/projects/${p.slug}`,
    })),
    ...listarArticulos().map((a) => {
      const { texto } = textoArticulo(a, idioma);
      return { id: `a-${a.slug}`, grupo: "articles" as const, titulo: texto.datos.titulo, detalle: texto.datos.fecha, href: `/blog/${a.slug}` };
    }),
    ...obtenerTecnologias()
      .filter((tec) => tec.destacada)
      .map((tec) => ({ id: `t-${tec.id}`, grupo: "technologies" as const, titulo: nombreTecnologia(tec, idioma), detalle: tg(tec.grupo), href: `/technologies?tec=${tec.id}` })),
  ];

  const claves = ["open", "title", "placeholder", "hint", "empty", "count", "groupPages", "groupProjects", "groupArticles", "groupTechnologies", "groupActions", "themeLight", "themeDark", "language", "cv", "copyEmail", "emailCopied", "emailFailed", "github", "linkedin", "verbs"];
  return {
    elementos,
    idiomas: routing.locales.map((codigo) => ({ codigo, nombre: tl(codigo) })),
    contacto: perfil.contacto,
    cv: CV_PDF[idioma],
    textos: Object.fromEntries(claves.map((k) => [k, (t.raw as (clave: string) => string)(k)])),
  };
}
