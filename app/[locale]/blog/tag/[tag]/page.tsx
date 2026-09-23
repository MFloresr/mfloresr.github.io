import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import TarjetaArticulo from "@/components/blog/TarjetaArticulo";
import { Link } from "@/i18n/navigation";
import type { Idioma } from "@/i18n/routing";
import { listarArticulos } from "@/lib/contenido/leer";
import { NOMBRE, SITE_URL, alternativas, urlAbsoluta } from "@/lib/sitio";

// Solo las etiquetas que usa algún artículo publicado
export const dynamicParams = false;

function etiquetasUsadas() {
  return [...new Set(listarArticulos().flatMap((a) => Object.values(a.textos).flatMap((x) => x.datos.etiquetas)))];
}

export function generateStaticParams() {
  return etiquetasUsadas().map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/tag/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  const idioma = (await getLocale()) as Idioma;
  const t = await getTranslations("blog");
  const ruta = `/blog/tag/${tag}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${t("tagTitle", { etiqueta: tag })} · ${NOMBRE}`,
    alternates: { canonical: urlAbsoluta(idioma, ruta), languages: alternativas(ruta) },
  };
}

export default async function PaginaEtiqueta({ params }: PageProps<"/[locale]/blog/tag/[tag]">) {
  const { tag } = await params;
  const idioma = (await getLocale()) as Idioma;
  const t = await getTranslations("blog");
  const articulos = listarArticulos().filter((a) => Object.values(a.textos).some((x) => x.datos.etiquetas.includes(tag)));
  if (!articulos.length) notFound();

  return (
    <div className="contenedor flex flex-col gap-10 py-14 md:py-18">
      <header className="flex flex-col gap-4">
        <Link href="/blog" className="text-sm text-tenue hover:text-texto">
          ← {t("back")}
        </Link>
        <h1 className="text-[36px] font-semibold tracking-[-0.03em] sm:text-5xl">{t("tagTitle", { etiqueta: tag })}</h1>
      </header>
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articulos.map((a) => (
          <li key={a.slug}>
            <TarjetaArticulo entrada={a} idioma={idioma} />
          </li>
        ))}
      </ul>
    </div>
  );
}
