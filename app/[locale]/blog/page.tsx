import { getLocale, getTranslations } from "next-intl/server";
import TarjetaArticulo from "@/components/blog/TarjetaArticulo";
import { Link } from "@/i18n/navigation";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { listarArticulos, textoArticulo } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("blog", "/blog");

export default async function PaginaBlog() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("blog");
  const tm = await getTranslations("meta.blog");
  const articulos = listarArticulos();
  const destacados = articulos.filter((a) => textoArticulo(a, idioma).texto.datos.destacado);
  const recientes = articulos.filter((a) => !destacados.includes(a));

  // Etiquetas con el número de artículos que las usan
  const etiquetas = new Map<string, number>();
  for (const a of articulos) {
    for (const e of textoArticulo(a, idioma).texto.datos.etiquetas) etiquetas.set(e, (etiquetas.get(e) ?? 0) + 1);
  }

  return (
    <div className="contenedor flex flex-col gap-12 py-14 md:py-18">
      <header className="flex max-w-3xl flex-col gap-3.5">
        <h1 className="text-[44px] font-semibold tracking-[-0.03em] sm:text-6xl">{tm("title")}</h1>
        <p className="text-lg leading-relaxed text-tenue sm:text-xl">{t("intro")}</p>
      </header>

      {articulos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-linea p-6 text-tenue">{t("empty")}</p>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[8fr_3fr] lg:gap-14">
          <div className="flex flex-col gap-12">
            {destacados.length > 0 && (
              <section aria-labelledby="t-destacados" className="flex flex-col gap-4">
                <h2 id="t-destacados" className="font-mono text-[13px] font-normal text-acento">
                  {t("featured")}
                </h2>
                <ul className="grid gap-5 md:grid-cols-2">
                  {destacados.map((a) => (
                    <li key={a.slug}>
                      <TarjetaArticulo entrada={a} idioma={idioma} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {recientes.length > 0 && (
              <section aria-labelledby="t-recientes" className="flex flex-col gap-4">
                <h2 id="t-recientes" className="font-mono text-[13px] font-normal text-acento">
                  {t("recent")}
                </h2>
                <ul className="grid gap-5 md:grid-cols-2">
                  {recientes.map((a) => (
                    <li key={a.slug}>
                      <TarjetaArticulo entrada={a} idioma={idioma} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <aside aria-labelledby="t-etiquetas" className="flex flex-col gap-4 self-start">
            <h2 id="t-etiquetas" className="font-mono text-[13px] font-normal text-tenue">
              {t("tags")}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {[...etiquetas].map(([etiqueta, n]) => (
                <li key={etiqueta}>
                  <Link href={`/blog/tag/${etiqueta}`} className="inline-flex rounded-md bg-chip px-2.5 py-1 font-mono text-[13px] hover:text-acento">
                    #{etiqueta} <span className="ml-1.5 text-tenue">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </div>
  );
}
