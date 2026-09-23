import { getTranslations } from "next-intl/server";
import Pendiente from "@/components/Pendiente";
import { Captura, Chips } from "@/components/ui/Basicos";
import { Flecha } from "@/components/ui/Iconos";
import { Link } from "@/i18n/navigation";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { nombreTecnologia } from "@/lib/contenido/idioma";
import type { Proyecto } from "@/lib/contenido/leer";
import { obtenerTecnologias } from "@/lib/contenido/leer";

/** Tarjeta de proyecto para el inicio (en rejilla). */
export default async function TarjetaProyecto({ proyecto, idioma }: { proyecto: Proyecto; idioma: IdiomaContenido }) {
  const t = await getTranslations("projects");
  const { slug, datos, textos } = proyecto;
  const texto = textos[idioma]?.datos;
  const nombres = new Map(obtenerTecnologias().map((tec) => [tec.id, nombreTecnologia(tec, idioma)]));
  const href = `/projects/${slug}`;

  return (
    <article className="flex h-full flex-col gap-3.5 rounded-2xl border border-linea bg-superficie p-4">
      <Captura className="h-44" />
      <span className="font-mono text-xs text-tenue">
        {t(`status.${datos.estado}`)} · {datos.anio}
      </span>
      <h3 className="text-[21px] font-semibold tracking-tight">
        <Link href={href} className="hover:text-acento">
          {texto?.titulo ?? textos.es!.datos.titulo}
        </Link>
      </h3>
      {texto ? (
        <p className="text-[15px] leading-relaxed text-tenue">{texto.resumen}</p>
      ) : (
        <Pendiente>{t("translationPending")}</Pendiente>
      )}
      {texto?.contexto && <p className="font-mono text-xs leading-relaxed text-tenue">{texto.contexto}</p>}
      <Chips items={datos.tecnologias.map((id) => nombres.get(id)!)} max={4} pequenas />
      <Link href={href} className="mt-auto inline-flex items-center gap-1.5 text-[15px] font-medium text-acento">
        {t("viewProject")}
        <Flecha />
      </Link>
    </article>
  );
}
