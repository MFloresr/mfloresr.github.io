import { getLocale, getTranslations } from "next-intl/server";
import Encaje from "@/components/ia/Encaje";
import Pregunta from "@/components/ia/Pregunta";
import { Etiqueta } from "@/components/ui/Basicos";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { listarProyectos, obtenerPerfil } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("ask", "/ask");

/** Página con las dos funciones de IA del portfolio. */
export default async function PaginaIA() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("ai");
  const tm = await getTranslations("meta.ask");
  const perfil = obtenerPerfil();

  // Título de cada proyecto en el idioma de la página, para los enlaces de las respuestas
  const titulos = Object.fromEntries(listarProyectos().map((p) => [p.slug, (p.textos[idioma] ?? p.textos.es)!.datos.titulo]));

  return (
    <div className="contenedor flex flex-col gap-14 py-14 md:gap-18 md:py-18">
      <header className="flex max-w-3xl flex-col gap-5">
        <h1 className="text-[44px] font-semibold tracking-[-0.03em] sm:text-6xl">{tm("title")}</h1>
        <p className="text-lg leading-relaxed text-tenue sm:text-xl">{t("intro")}</p>
        <p className="text-sm leading-relaxed text-tenue">{t("privacy")}</p>
      </header>

      <section aria-labelledby="t-encaje" className="grid gap-8 lg:grid-cols-[4fr_7fr] lg:gap-16">
        <div className="flex flex-col gap-3">
          <Etiqueta numero="01">{t("fit.section")}</Etiqueta>
          <h2 id="t-encaje" className="text-[28px] font-semibold tracking-tight sm:text-4xl">
            {t("fit.title")}
          </h2>
          <p className="leading-relaxed text-tenue">{t("fit.text")}</p>
        </div>
        <Encaje titulos={titulos} email={perfil.contacto.email} />
      </section>

      <section aria-labelledby="t-pregunta" className="grid gap-8 border-t border-linea pt-14 md:pt-18 lg:grid-cols-[4fr_7fr] lg:gap-16">
        <div className="flex flex-col gap-3">
          <Etiqueta numero="02">{t("ask.section")}</Etiqueta>
          <h2 id="t-pregunta" className="text-[28px] font-semibold tracking-tight sm:text-4xl">
            {t("ask.title")}
          </h2>
          <p className="leading-relaxed text-tenue">{t("ask.text")}</p>
        </div>
        <Pregunta titulos={titulos} />
      </section>
    </div>
  );
}
