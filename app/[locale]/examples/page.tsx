import { getLocale, getTranslations } from "next-intl/server";
import RejillaEjemplos from "@/components/proyectos/RejillaEjemplos";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { listarEjemplos } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("examples", "/examples");

export default async function PaginaEjemplos() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("examples");
  const tm = await getTranslations("meta");
  const lista = listarEjemplos();
  const nombreSector = (clave: string) => t(`sectors.${clave as "motor"}`);

  const ejemplos = lista.map((e) => ({
    id: e.id,
    nombre: e.nombre,
    sector: e.sector,
    sectorNombre: nombreSector(e.sector),
    tagline: e.tagline[idioma] ?? e.tagline.es ?? "",
    detalle: e.detalle[idioma] ?? e.detalle.es ?? "",
    url: e.url,
    repositorio: e.repositorio,
  }));
  const sectores = [...new Set(lista.map((e) => e.sector))].map((clave) => ({ clave, nombre: nombreSector(clave) }));

  return (
    <div className="contenedor flex flex-col py-14 md:py-18">
      <header className="flex flex-col gap-3.5 pb-8">
        <h1 className="text-[40px] font-bold sm:text-6xl">{tm("examples.title")}</h1>
        <p className="max-w-3xl text-lg text-tenue sm:text-xl">{t("intro")}</p>
        <p className="max-w-3xl text-[15px] text-tenue">{t("note")}</p>
      </header>
      <RejillaEjemplos
        ejemplos={ejemplos}
        sectores={sectores}
        textos={{
          sector: t("sector"),
          all: t("all"),
          count: t.raw("count") as string,
          clear: t("clear"),
          noResults: t("noResults"),
          visit: t("visit"),
          code: t("code"),
          prev: t("prev"),
          next: t("next"),
          pagination: t("pagination"),
          goPage: t.raw("goPage") as string,
        }}
      />
    </div>
  );
}
