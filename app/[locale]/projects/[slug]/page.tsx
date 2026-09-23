import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import TarjetaArticulo from "@/components/blog/TarjetaArticulo";
import Pendiente from "@/components/Pendiente";
import Arquitectura from "@/components/proyectos/Arquitectura";
import Boton from "@/components/ui/Boton";
import { Captura, Chips, ListaGuion } from "@/components/ui/Basicos";
import { Link } from "@/i18n/navigation";
import type { Idioma } from "@/i18n/routing";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { nombreTecnologia } from "@/lib/contenido/idioma";
import { listarArticulos, listarSlugsProyectos, obtenerProyecto, obtenerTecnologias } from "@/lib/contenido/leer";
import { Mdx } from "@/lib/contenido/mdx";
import { NOMBRE, SITE_URL, alternativas, urlAbsoluta } from "@/lib/sitio";

// Solo existen los proyectos de content/proyectos; cualquier otro slug da 404
export const dynamicParams = false;

export function generateStaticParams() {
  return listarSlugsProyectos().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const proyecto = obtenerProyecto(slug);
  if (!proyecto) return {};
  const idioma = (await getLocale()) as Idioma;
  const texto = proyecto.textos[idioma]?.datos ?? proyecto.textos.es!.datos;
  const ruta = `/projects/${slug}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${texto.titulo} · ${NOMBRE}`,
    description: texto.resumen,
    alternates: { canonical: urlAbsoluta(idioma, ruta), languages: alternativas(ruta) },
    openGraph: { type: "article", title: texto.titulo, description: texto.resumen, url: urlAbsoluta(idioma, ruta) },
  };
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5">
      <h2 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">{titulo}</h2>
      {children}
    </section>
  );
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-linea py-3.5 last:border-b-0">
      <dt className="font-mono text-xs text-tenue">{etiqueta}</dt>
      <dd className="text-[15px]">{children}</dd>
    </div>
  );
}

export default async function PaginaProyecto({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { slug } = await params;
  const proyecto = obtenerProyecto(slug);
  if (!proyecto) notFound();

  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("projects");
  const tui = await getTranslations("ui");
  const tp = await getTranslations("pending");
  const tb = await getTranslations("blog");
  const { datos } = proyecto;
  const texto = proyecto.textos[idioma];
  const nombres = new Map(obtenerTecnologias().map((tec) => [tec.id, nombreTecnologia(tec, idioma)]));
  const pendiente = <Pendiente>{tp("field")}</Pendiente>;
  const parrafo = (valor: string | null) => (valor ? <p className="text-[17px] leading-relaxed text-tenue">{valor}</p> : pendiente);
  const sinProtocolo = (url: string) => url.replace(/^https:\/\//, "");

  // Sin traducción: se avisa y se enlaza a la versión en castellano
  if (!texto) {
    return (
      <article className="contenedor flex flex-col gap-6 py-14">
        <Link href="/projects" className="text-sm text-tenue hover:text-texto">
          ← {t("back")}
        </Link>
        <h1 className="text-[44px] font-semibold tracking-tight sm:text-6xl">{proyecto.textos.es!.datos.titulo}</h1>
        <Pendiente>{t("translationPending")}</Pendiente>
        <Link href={`/projects/${slug}`} locale="es" className="font-medium text-acento underline underline-offset-4">
          {t("readInSpanish")}
        </Link>
      </article>
    );
  }

  const d = texto.datos;
  // Artículos del blog que citan este proyecto
  const articulos = listarArticulos().filter((a) => Object.values(a.textos).some((x) => x.datos.proyectos.includes(slug)));

  return (
    <article>
      <header className="contenedor flex flex-col gap-5 pt-10 pb-8 md:pt-14">
        <Link href="/projects" className="text-sm text-tenue hover:text-texto">
          ← {t("back")}
        </Link>
        <span className="font-mono text-[13px] text-tenue">
          {t(`status.${datos.estado}`)} · {datos.anio}
        </span>
        <h1 className="text-[44px] leading-none font-semibold tracking-[-0.03em] sm:text-6xl lg:text-[72px]">{d.titulo}</h1>
        <p className="max-w-3xl text-lg leading-normal text-tenue sm:text-[22px]">{d.resumen}</p>
        {d.contexto && <p className="font-mono text-[13px] text-tenue">{d.contexto}</p>}
        {!d.revisado && <Pendiente>{t("draft")}</Pendiente>}
        <div className="flex flex-wrap gap-3">
          {datos.demo && (
            <Boton href={datos.demo.url} externo>
              {t("demo")}
            </Boton>
          )}
          {datos.repositorio && (
            <Boton href={datos.repositorio} externo variante="secundario">
              {t("code")}
            </Boton>
          )}
        </div>
        <Captura className="mt-4 h-60 sm:h-96 lg:h-[520px]" />
      </header>

      <div className="contenedor grid gap-12 pt-6 pb-16 lg:grid-cols-[8fr_4fr] lg:gap-16">
        <div className="flex flex-col gap-12">
          <Seccion titulo={t("sections.goal")}>{parrafo(d.objetivo)}</Seccion>
          <Seccion titulo={t("sections.problem")}>{parrafo(d.problema)}</Seccion>
          {d.arquitectura && (
            <Seccion titulo={tui("diagramLabel")}>
              <Arquitectura datos={d.arquitectura} />
            </Seccion>
          )}
          <Seccion titulo={t("sections.features")}>
            {d.funcionalidades ? <ListaGuion items={d.funcionalidades} className="text-base" /> : pendiente}
          </Seccion>
          <Seccion titulo={t("sections.challenges")}>
            {d.retos ? (
              <ol className="grid gap-3.5 md:grid-cols-2">
                {d.retos.map((r, i) => (
                  <li key={r.titulo} className="flex flex-col gap-2 rounded-2xl border border-linea bg-superficie p-5 sm:p-6">
                    <span className="font-mono text-xs text-acento">0{i + 1}</span>
                    <strong className="text-[17px] font-semibold">{r.titulo}</strong>
                    <span className="text-[15px] leading-relaxed text-tenue">{r.texto}</span>
                  </li>
                ))}
              </ol>
            ) : (
              pendiente
            )}
          </Seccion>
          <Seccion titulo={t("sections.state")}>{parrafo(d.estadoTexto)}</Seccion>
          <Seccion titulo={t("sections.improvements")}>{d.mejoras ? <ListaGuion items={d.mejoras} /> : pendiente}</Seccion>
          {texto.cuerpo && (
            <div className="flex flex-col gap-4">
              <Mdx fuente={texto.cuerpo} />
            </div>
          )}
        </div>

        <aside className="self-start rounded-2xl border border-linea bg-superficie p-5 sm:p-6 lg:sticky lg:top-6">
          <h2 className="pb-1 font-mono text-[13px] font-normal text-tenue">{tui("facts")}</h2>
          <dl>
            <Dato etiqueta={tui("status")}>{t(`status.${datos.estado}`)}</Dato>
            <Dato etiqueta={tui("year")}>{datos.anio}</Dato>
            <Dato etiqueta={t("sections.user")}>{d.usuario ?? pendiente}</Dato>
            <Dato etiqueta={t("sections.technologies")}>
              <Chips items={datos.tecnologias.map((id) => nombres.get(id)!)} pequenas />
            </Dato>
            <Dato etiqueta={t("sections.links")}>
              <span className="flex flex-col gap-1.5">
                {datos.demo && (
                  <a href={datos.demo.url} target="_blank" rel="noopener" className="font-medium break-all text-acento">
                    {sinProtocolo(datos.demo.url)}
                  </a>
                )}
                {datos.repositorio && (
                  <a href={datos.repositorio} target="_blank" rel="noopener" className="font-medium break-all text-acento">
                    {sinProtocolo(datos.repositorio)}
                  </a>
                )}
                {datos.demo?.requiereCuenta && <span className="text-[13px] text-tenue">{t("demoAccount")}</span>}
              </span>
            </Dato>
          </dl>
        </aside>
      </div>
      {articulos.length > 0 && (
        <section aria-labelledby="t-articulos" className="contenedor flex flex-col gap-4 border-t border-linea py-10 md:py-14">
          <h2 id="t-articulos" className="text-[22px] font-semibold">
            {tb("relatedArticles")}
          </h2>
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articulos.map((a) => (
              <li key={a.slug}>
                <TarjetaArticulo entrada={a} idioma={idioma} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
