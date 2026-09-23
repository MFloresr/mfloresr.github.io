import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import PaginaProvisional from "@/components/PaginaProvisional";
import type { Idioma } from "@/i18n/routing";
import { NOMBRE, PROYECTOS, SITE_URL, alternativas, urlAbsoluta } from "@/lib/sitio";

type Slug = (typeof PROYECTOS)[number];
const esProyecto = (slug: string): slug is Slug => (PROYECTOS as readonly string[]).includes(slug);

// Solo existen los proyectos publicados; cualquier otro slug da 404
export const dynamicParams = false;

export function generateStaticParams() {
  return PROYECTOS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  if (!esProyecto(slug)) return {};
  const idioma = (await getLocale()) as Idioma;
  const t = await getTranslations("projects.names");
  const ruta = `/projects/${slug}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${t(slug)} · ${NOMBRE}`,
    alternates: { canonical: urlAbsoluta(idioma, ruta), languages: alternativas(ruta) },
  };
}

export default async function PaginaProyecto({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { slug } = await params;
  if (!esProyecto(slug)) notFound();
  const t = await getTranslations();
  return <PaginaProvisional titulo={t(`projects.names.${slug}`)} pendiente={t("pending.project")} />;
}
