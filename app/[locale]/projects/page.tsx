import { getLocale, getTranslations } from "next-intl/server";
import Pendiente from "@/components/Pendiente";
import { Captura, Chips } from "@/components/ui/Basicos";
import { Externo, Flecha } from "@/components/ui/Iconos";
import { Link } from "@/i18n/navigation";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { listarProyectos, obtenerTecnologias } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("projects", "/projects");

export default async function PaginaProyectos() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations();
  const nombres = new Map(obtenerTecnologias().map((tec) => [tec.id, tec.nombre]));
  const proyectos = listarProyectos();

  return (
    <div className="contenedor flex flex-col py-14 md:py-18">
      <header className="flex flex-col gap-3.5 pb-6">
        <h1 className="text-[44px] font-semibold tracking-[-0.03em] sm:text-6xl">{t("meta.projects.title")}</h1>
        <p className="text-lg text-tenue sm:text-xl">{t("projects.intro")}</p>
      </header>

      <ol>
        {proyectos.map(({ slug, datos, textos }, i) => {
          const texto = textos[idioma]?.datos;
          const href = `/projects/${slug}`;
          return (
            <li key={slug} className="grid gap-6 border-b border-linea py-10 md:grid-cols-[5fr_6fr] md:items-center md:gap-12">
              <Captura className="h-56 md:h-72" />
              <article className="flex flex-col gap-3.5">
                <span className="font-mono text-[13px] text-tenue">
                  0{i + 1} · {t(`projects.status.${datos.estado}`)} · {datos.anio}
                </span>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-[34px]">
                  <Link href={href} className="hover:text-acento">
                    {texto?.titulo ?? textos.es!.datos.titulo}
                  </Link>
                </h2>
                {texto ? (
                  <p className="text-[17px] leading-relaxed text-tenue">{texto.resumen}</p>
                ) : (
                  <Pendiente>{t("projects.translationPending")}</Pendiente>
                )}
                {texto?.contexto && <p className="font-mono text-[13px] leading-relaxed text-tenue">{texto.contexto}</p>}
                {texto && !texto.revisado && <Pendiente>{t("projects.draft")}</Pendiente>}
                <Chips items={datos.tecnologias.map((id) => nombres.get(id)!)} max={5} />
                <div className="mt-1 flex flex-wrap items-center gap-5">
                  <Link href={href} className="inline-flex items-center gap-1.5 text-[15px] font-medium text-acento">
                    {t("projects.viewProject")}
                    <Flecha />
                  </Link>
                  {datos.repositorio && (
                    <a href={datos.repositorio} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[15px] hover:text-acento">
                      {t("projects.code")}
                      <Externo />
                    </a>
                  )}
                  {datos.demo && (
                    <a href={datos.demo.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-[15px] hover:text-acento">
                      {t("projects.demo")}
                      <Externo />
                    </a>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
