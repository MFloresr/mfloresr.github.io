import { getLocale, getTranslations } from "next-intl/server";
import { Chips } from "@/components/ui/Basicos";
import { Link } from "@/i18n/navigation";
import { GRUPOS, type IdiomaContenido } from "@/lib/contenido/esquemas";
import { enIdioma } from "@/lib/contenido/idioma";
import { obtenerTecnologias, proyectosQueUsan } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("technologies", "/technologies");

export default async function PaginaTecnologias() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("technologies");
  const tm = await getTranslations("meta.technologies");
  const tg = await getTranslations("groups");
  const tp = await getTranslations("pending");
  const tecnologias = obtenerTecnologias();

  const porGrupo = (destacada: boolean) =>
    GRUPOS.map((grupo) => ({ grupo, lista: tecnologias.filter((tec) => tec.grupo === grupo && tec.destacada === destacada) })).filter(
      (g) => g.lista.length,
    );

  return (
    <div className="contenedor flex flex-col gap-11 py-14 md:py-18">
      <header className="flex max-w-3xl flex-col gap-3.5">
        <h1 className="text-[44px] font-semibold tracking-[-0.03em] sm:text-6xl">{tm("title")}</h1>
        <p className="text-lg leading-relaxed text-tenue sm:text-xl">{t("intro")}</p>
      </header>

      {porGrupo(true).map(({ grupo, lista }) => (
        <section key={grupo} aria-labelledby={`g-${grupo}`} className="grid gap-2 lg:grid-cols-[3fr_9fr] lg:gap-8">
          <h2 id={`g-${grupo}`} className="font-mono text-sm font-medium text-acento lg:pt-4">
            {tg(grupo)}
          </h2>
          <dl>
            {lista.map((tec) => {
              const proyectos = proyectosQueUsan(tec.id);
              const contexto = tec.contexto ? enIdioma(tec.contexto, idioma) : null;
              return (
                <div key={tec.id} className="grid gap-1 border-b border-linea py-3.5 sm:grid-cols-[260px_1fr] sm:items-baseline sm:gap-4">
                  <dt className="text-[17px] font-medium">{tec.nombre}</dt>
                  <dd className="text-[15px] text-tenue">
                    {proyectos.length > 0 ? (
                      <span className="flex flex-wrap gap-x-1.5">
                        <span className="sr-only">{t("usedIn")}:</span>
                        {proyectos.map((p, i) => (
                          <span key={p.slug}>
                            <Link href={`/projects/${p.slug}`} className="text-texto underline decoration-linea underline-offset-4 hover:decoration-acento">
                              {p.textos[idioma]?.datos.titulo ?? p.textos.es!.datos.titulo}
                            </Link>
                            {i < proyectos.length - 1 && " ·"}
                          </span>
                        ))}
                      </span>
                    ) : tec.contexto ? (
                      (contexto ?? <span className="text-pendiente-texto">{tp("label")}</span>)
                    ) : (
                      <span className="font-mono text-[13px]">{t("noProject")}</span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}

      <section aria-labelledby="t-tambien" className="flex flex-col gap-6 rounded-2xl bg-chip p-6 sm:p-8">
        <h2 id="t-tambien" className="text-[22px] font-semibold">
          {t("alsoTitle")}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {porGrupo(false).map(({ grupo, lista }) => (
            <div key={grupo} className="flex flex-col gap-2.5">
              <h3 className="font-mono text-[13px] font-normal text-tenue">{tg(grupo)}</h3>
              <Chips items={lista.map((tec) => tec.nombre)} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
