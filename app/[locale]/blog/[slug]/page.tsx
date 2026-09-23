import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { fechaLocal } from "@/components/blog/TarjetaArticulo";
import Pendiente from "@/components/Pendiente";
import TarjetaProyecto from "@/components/proyectos/TarjetaProyecto";
import { Link } from "@/i18n/navigation";
import { routing, type Idioma } from "@/i18n/routing";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { listarArticulos, obtenerProyecto, textoArticulo } from "@/lib/contenido/leer";
import { Mdx } from "@/lib/contenido/mdx";
import { NOMBRE, SITE_URL, urlAbsoluta } from "@/lib/sitio";

// Solo existen los artículos de content/blog (sin borradores en producción)
export const dynamicParams = false;

export function generateStaticParams() {
  return listarArticulos().map((a) => ({ slug: a.slug }));
}

function buscar(slug: string) {
  return listarArticulos().find((a) => a.slug === slug) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entrada = buscar(slug);
  if (!entrada) return {};
  const idioma = (await getLocale()) as Idioma;
  const { texto, traducido } = textoArticulo(entrada, idioma);
  const ruta = `/blog/${slug}`;
  // hreflang solo para los idiomas en los que existe el artículo
  const languages = Object.fromEntries(
    routing.locales.filter((i) => entrada.textos[i]).map((i) => [i, urlAbsoluta(i, ruta)]),
  );
  return {
    metadataBase: new URL(SITE_URL),
    title: `${texto.datos.titulo} · ${NOMBRE}`,
    description: texto.datos.resumen,
    alternates: { canonical: urlAbsoluta(idioma, ruta), languages },
    // Una página sin traducción no se indexa: remite a la versión original
    robots: traducido && !texto.datos.borrador ? undefined : { index: false },
    openGraph: {
      type: "article",
      title: texto.datos.titulo,
      description: texto.datos.resumen,
      url: urlAbsoluta(idioma, ruta),
      publishedTime: texto.datos.fecha,
      ...(texto.datos.actualizado && { modifiedTime: texto.datos.actualizado }),
    },
  };
}

export default async function PaginaArticulo({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const { slug } = await params;
  const entrada = buscar(slug);
  if (!entrada) notFound();

  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("blog");
  const formato = await getFormatter();
  const { texto, idioma: idiomaTexto, traducido } = textoArticulo(entrada, idioma);
  const d = texto.datos;
  const relacionados = d.proyectos.map((p) => obtenerProyecto(p)!).filter(Boolean);
  const fecha = (iso: string) => formato.dateTime(fechaLocal(iso), { dateStyle: "long" });

  return (
    <article className="contenedor flex flex-col gap-10 py-10 md:py-14">
      <header className="flex max-w-3xl flex-col gap-5">
        <Link href="/blog" className="text-sm text-tenue hover:text-texto">
          ← {t("back")}
        </Link>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[13px] text-tenue">
          <span className="text-acento">{t(`categoryNames.${d.categoria}`)}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={d.fecha}>{fecha(d.fecha)}</time>
          <span aria-hidden="true">·</span>
          <span>{t("readingTime", { minutos: texto.minutos })}</span>
        </p>
        <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.03em] sm:text-5xl" lang={idiomaTexto}>
          {d.titulo}
        </h1>
        <p className="text-lg leading-relaxed text-tenue sm:text-xl" lang={idiomaTexto}>
          {d.resumen}
        </p>
        {d.actualizado && <p className="font-mono text-xs text-tenue">{t("updated", { fecha: fecha(d.actualizado) })}</p>}
        {d.borrador && <Pendiente>{t("draftNotice")}</Pendiente>}
        {!traducido && (
          <div className="flex flex-wrap items-center gap-3">
            <Pendiente>{t("notTranslated")}</Pendiente>
            <Link href={`/blog/${slug}`} locale={idiomaTexto as Idioma} className="text-[15px] font-medium text-acento underline underline-offset-4">
              {t("readOriginal", { idioma: t(`languages.${idiomaTexto}`) })}
            </Link>
          </div>
        )}
        {d.etiquetas.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {d.etiquetas.map((e) => (
              <li key={e}>
                <Link href={`/blog/tag/${e}`} className="inline-flex rounded-md bg-chip px-2 py-0.5 font-mono text-[13px] hover:text-acento">
                  #{e}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="prosa max-w-3xl" lang={idiomaTexto}>
        <Mdx fuente={texto.cuerpo} />
      </div>

      {relacionados.length > 0 && (
        <section aria-labelledby="t-relacionados" className="flex flex-col gap-4 border-t border-linea pt-10">
          <h2 id="t-relacionados" className="text-[22px] font-semibold">
            {t("related")}
          </h2>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {relacionados.map((p) => (
              <li key={p.slug}>
                <TarjetaProyecto proyecto={p} idioma={idioma} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
