import type { Metadata } from "next";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Idioma } from "@/i18n/routing";
import type { IdiomaContenido, PaginaLegal } from "@/lib/contenido/esquemas";
import { obtenerLegal } from "@/lib/contenido/leer";
import { Mdx } from "@/lib/contenido/mdx";
import { NOMBRE, SITE_URL, alternativas, urlAbsoluta } from "@/lib/sitio";

const RUTAS: Record<PaginaLegal, string> = { legal: "/legal", privacy: "/privacy", cookies: "/cookies" };

/** Metadatos de una página legal a partir de su propio texto. */
export async function metadatosLegal(pagina: PaginaLegal): Promise<Metadata> {
  const idioma = (await getLocale()) as Idioma;
  const { datos } = obtenerLegal(pagina, idioma);
  const ruta = RUTAS[pagina];
  return {
    metadataBase: new URL(SITE_URL),
    title: `${datos.titulo} · ${NOMBRE}`,
    description: datos.descripcion,
    alternates: { canonical: urlAbsoluta(idioma, ruta), languages: alternativas(ruta) },
  };
}

/** Página de texto legal: título, fecha de la última revisión y cuerpo en MDX. */
export default async function PaginaLegal({ pagina }: { pagina: PaginaLegal }) {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("legal");
  const formato = await getFormatter();
  const { datos, cuerpo } = obtenerLegal(pagina, idioma);
  const fecha = formato.dateTime(new Date(`${datos.actualizado}T12:00:00`), { dateStyle: "long" });

  return (
    <article className="contenedor flex flex-col gap-8 py-10 md:py-14">
      <header className="flex max-w-3xl flex-col gap-4">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm text-tenue hover:text-texto">
          ← {t("back")}
        </Link>
        <h1 className="text-[32px] leading-tight font-bold sm:text-5xl">{datos.titulo}</h1>
        <p className="text-[15px] text-tenue">{t("updated", { fecha })}</p>
      </header>
      <div className="prosa max-w-3xl">
        <Mdx fuente={cuerpo} />
      </div>
    </article>
  );
}
