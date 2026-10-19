import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import type { Idioma } from "@/i18n/routing";
import { NOMBRE, SITE_URL, alternativas, imagenCompartir, urlAbsoluta } from "./sitio";

type ClavePagina = "home" | "projects" | "about" | "technologies" | "blog" | "ask" | "contact";

/** Código Open Graph de cada idioma publicado. */
const LOCALE_OG: Record<Idioma, string> = { es: "es_ES", en: "en_GB", ca: "ca_ES", fr: "fr_FR" };

/**
 * Metadatos comunes de una página: título, descripción, canónica, hreflang y Open Graph.
 * `ruta` es la ruta sin idioma ("" para el inicio, "/projects", ...).
 */
export async function metadatosPagina(clave: ClavePagina, ruta: string): Promise<Metadata> {
  const idioma = (await getLocale()) as Idioma;
  const t = await getTranslations("meta");
  const titulo = clave === "home" ? t("home.title") : `${t(`${clave}.title`)} · ${NOMBRE}`;
  const descripcion = t(`${clave}.description`);
  const imagen = imagenCompartir(`site-${idioma}.jpg`, titulo);

  return {
    metadataBase: new URL(SITE_URL),
    title: titulo,
    description: descripcion,
    alternates: { canonical: urlAbsoluta(idioma, ruta), languages: alternativas(ruta) },
    openGraph: {
      type: "website",
      siteName: NOMBRE,
      title: titulo,
      description: descripcion,
      url: urlAbsoluta(idioma, ruta),
      locale: LOCALE_OG[idioma],
      images: imagen.openGraph,
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: imagen.twitter },
  };
}
