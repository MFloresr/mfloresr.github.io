import { getFormatter, getTranslations } from "next-intl/server";
import { Flecha } from "@/components/ui/Iconos";
import { Link } from "@/i18n/navigation";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { textoArticulo, type EntradaBlog } from "@/lib/contenido/leer";

/** Fecha ISO (AAAA-MM-DD) como fecha local, sin desfases de zona horaria. */
export function fechaLocal(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

/** Resumen de un artículo para listados (blog, etiquetas, inicio y fichas de proyecto). */
export default async function TarjetaArticulo({ entrada, idioma }: { entrada: EntradaBlog; idioma: IdiomaContenido }) {
  const t = await getTranslations("blog");
  const formato = await getFormatter();
  const { texto, idioma: idiomaTexto, traducido } = textoArticulo(entrada, idioma);
  const d = texto.datos;

  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-linea bg-superficie p-5 sm:p-6">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-tenue">
        <time dateTime={d.fecha}>{formato.dateTime(fechaLocal(d.fecha), { dateStyle: "medium" })}</time>
        <span aria-hidden="true">·</span>
        <span>{t("readingTime", { minutos: texto.minutos })}</span>
        <span aria-hidden="true">·</span>
        <span className="text-acento">{t(`categoryNames.${d.categoria}`)}</span>
        {!traducido && (
          <span className="rounded bg-chip px-1.5 py-0.5 text-texto">{t("onlyIn", { idioma: t(`languages.${idiomaTexto}`) })}</span>
        )}
        {d.borrador && <span className="rounded bg-pendiente-fondo px-1.5 py-0.5 text-pendiente-texto">{t("draft")}</span>}
      </p>
      <h3 className="text-xl leading-snug font-semibold tracking-tight">
        <Link href={`/blog/${entrada.slug}`} className="hover:text-acento">
          {d.titulo}
        </Link>
      </h3>
      <p className="text-[15px] leading-relaxed text-tenue">{d.resumen}</p>
      <Link href={`/blog/${entrada.slug}`} className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-medium text-acento">
        {t("readArticle")}
        <Flecha />
      </Link>
    </article>
  );
}
