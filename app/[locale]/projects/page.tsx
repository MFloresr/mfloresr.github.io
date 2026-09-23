import { getLocale, getTranslations } from "next-intl/server";
import Pendiente from "@/components/Pendiente";
import { Link } from "@/i18n/navigation";
import { listarProyectos } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";

export const generateMetadata = () => metadatosPagina("projects", "/projects");

export default async function PaginaProyectos() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations();
  const proyectos = listarProyectos();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("meta.projects.title")}</h1>
        <p className="text-tenue">{t("projects.intro")}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {proyectos.map(({ slug, datos, textos }) => {
          const texto = textos[idioma]?.datos;
          return (
            <li key={slug}>
              <article className="flex h-full flex-col gap-3 rounded-xl border border-linea bg-superficie p-5">
                <p className="text-xs font-medium tracking-wide text-tenue uppercase">
                  {t(`projects.status.${datos.estado}`)} · {datos.anio}
                </p>
                <h2 className="text-xl font-semibold">
                  <Link href={`/projects/${slug}`} className="hover:text-acento">
                    {texto?.titulo ?? textos.es!.datos.titulo}
                  </Link>
                </h2>
                {texto ? <p className="text-tenue">{texto.resumen}</p> : <Pendiente>{t("projects.translationPending")}</Pendiente>}
                {texto && !texto.revisado && <Pendiente>{t("projects.draft")}</Pendiente>}
                <Link href={`/projects/${slug}`} className="mt-auto text-sm font-medium text-acento underline underline-offset-4">
                  {t("projects.viewProject")}
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
