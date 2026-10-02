import { getLocale, getTranslations } from "next-intl/server";
import ListaFiltrable from "@/components/proyectos/ListaFiltrable";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { listarProyectos } from "@/lib/contenido/leer";
import { construirDatosInicio } from "@/lib/datosInicio";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("projects", "/projects");

export default async function PaginaProyectos() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations();
  const datos = await construirDatosInicio(idioma);
  const proyectos = listarProyectos();

  const filtrables = datos.proyectos.map((p) => ({
    ...p,
    borrador: proyectos.find((x) => x.slug === p.slug)!.textos[idioma]?.datos.revisado === false,
  }));
  const estados = [...new Set(datos.proyectos.map((p) => p.estadoClave))].map((clave) => ({ clave, nombre: t(`projects.status.${clave as "produccion" | "terminado" | "en-desarrollo"}`) }));

  return (
    <div className="contenedor flex flex-col py-14 md:py-18">
      <header className="flex flex-col gap-3.5 pb-8">
        <h1 className="text-[40px] font-bold sm:text-6xl">{t("meta.projects.title")}</h1>
        <p className="text-lg text-tenue sm:text-xl">{t("projects.intro")}</p>
      </header>

      <ListaFiltrable
        proyectos={filtrables}
        tecnologias={datos.tecnologias}
        estados={estados}
        textos={{
          search: t("filters.search"),
          status: t("filters.status"),
          technology: t("filters.technology"),
          all: t("filters.all"),
          allTech: t("filters.allTech"),
          count: t.raw("filters.count") as string,
          clear: t("filters.clear"),
          noResults: t("filters.noResults"),
          code: t("projects.code"),
          demo: t("projects.demo"),
          view: t("projects.viewProject"),
          pending: t("pending.label"),
          translationPending: t("projects.translationPending"),
          draft: t("projects.draft"),
        }}
      />
    </div>
  );
}
