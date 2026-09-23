import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Pendiente from "@/components/Pendiente";
import { Link } from "@/i18n/navigation";
import type { Idioma } from "@/i18n/routing";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { listarSlugsProyectos, obtenerProyecto, obtenerTecnologias } from "@/lib/contenido/leer";
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
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

export default async function PaginaProyecto({ params }: PageProps<"/[locale]/projects/[slug]">) {
  const { slug } = await params;
  const proyecto = obtenerProyecto(slug);
  if (!proyecto) notFound();

  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("projects");
  const tg = await getTranslations("pending");
  const { datos } = proyecto;
  const texto = proyecto.textos[idioma];
  const catalogo = new Map(obtenerTecnologias().map((tec) => [tec.id, tec]));
  const pendiente = <Pendiente>{tg("field")}</Pendiente>;

  // Sin traducción: se avisa y se enlaza a la versión en castellano
  if (!texto) {
    return (
      <article className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{proyecto.textos.es!.datos.titulo}</h1>
        <Pendiente>{t("translationPending")}</Pendiente>
        <Link href={`/projects/${slug}`} locale="es" className="font-medium text-acento underline underline-offset-4">
          {t("readInSpanish")}
        </Link>
      </article>
    );
  }

  const d = texto.datos;
  const campo = (valor: string | null) => (valor ? <p className="text-tenue">{valor}</p> : pendiente);

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Link href="/projects" className="text-sm text-tenue hover:text-texto">
          ← {t("back")}
        </Link>
        <p className="text-xs font-medium tracking-wide text-tenue uppercase">
          {t(`status.${datos.estado}`)} · {datos.anio}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{d.titulo}</h1>
        <p className="text-lg text-tenue">{d.resumen}</p>
        {!d.revisado && <Pendiente>{t("draft")}</Pendiente>}
      </header>

      {d.contexto && (
        <Seccion titulo={t("sections.context")}>
          <p className="text-tenue">{d.contexto}</p>
        </Seccion>
      )}
      <Seccion titulo={t("sections.goal")}>{campo(d.objetivo)}</Seccion>
      <Seccion titulo={t("sections.problem")}>{campo(d.problema)}</Seccion>
      <Seccion titulo={t("sections.user")}>{campo(d.usuario)}</Seccion>

      <Seccion titulo={t("sections.technologies")}>
        <ul className="flex flex-wrap gap-2">
          {datos.tecnologias.map((id) => (
            <li key={id} className="rounded-md border border-linea px-2 py-1 text-sm">
              {catalogo.get(id)!.nombre}
            </li>
          ))}
        </ul>
      </Seccion>

      <Seccion titulo={t("sections.features")}>
        {d.funcionalidades ? (
          <ul className="list-disc space-y-1 pl-5 text-tenue">
            {d.funcionalidades.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : (
          pendiente
        )}
      </Seccion>

      <Seccion titulo={t("sections.state")}>{campo(d.estadoTexto)}</Seccion>

      <Seccion titulo={t("sections.challenges")}>
        {d.retos ? (
          <dl className="flex flex-col gap-3">
            {d.retos.map((r) => (
              <div key={r.titulo}>
                <dt className="font-medium">{r.titulo}</dt>
                <dd className="text-tenue">{r.texto}</dd>
              </div>
            ))}
          </dl>
        ) : (
          pendiente
        )}
      </Seccion>

      <Seccion titulo={t("sections.improvements")}>
        {d.mejoras ? (
          <ul className="list-disc space-y-1 pl-5 text-tenue">
            {d.mejoras.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        ) : (
          pendiente
        )}
      </Seccion>

      <Seccion titulo={t("sections.links")}>
        <div className="flex flex-wrap gap-4">
          {datos.repositorio ? (
            <a href={datos.repositorio} className="font-medium text-acento underline underline-offset-4" rel="noopener" target="_blank">
              {t("code")}
            </a>
          ) : (
            pendiente
          )}
          {datos.demo && (
            <a href={datos.demo.url} className="font-medium text-acento underline underline-offset-4" rel="noopener" target="_blank">
              {t("demo")}
            </a>
          )}
        </div>
        {datos.demo?.requiereCuenta && <p className="text-sm text-tenue">{t("demoAccount")}</p>}
      </Seccion>

      <div className="flex flex-col gap-4">
        <Mdx fuente={texto.cuerpo} />
      </div>
    </article>
  );
}
