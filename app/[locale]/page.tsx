import { getLocale, getTranslations } from "next-intl/server";
import TarjetaArticulo from "@/components/blog/TarjetaArticulo";
import DatosEstructurados from "@/components/DatosEstructurados";
import DiagramaPerfil from "@/components/inicio/DiagramaPerfil";
import EnlaceCV from "@/components/EnlaceCV";
import Pendiente from "@/components/Pendiente";
import { Consola, ListaProyectos, PanelConexiones, ProveedorExplorar } from "@/components/inicio/Explorar";
import Boton from "@/components/ui/Boton";
import { Chips, Etiqueta, ListaGuion } from "@/components/ui/Basicos";
import { Externo, Flecha } from "@/components/ui/Iconos";
import { Link } from "@/i18n/navigation";
import { GRUPOS, type IdiomaContenido } from "@/lib/contenido/esquemas";
import { enIdioma, nombreTecnologia } from "@/lib/contenido/idioma";
import { listarArticulos, obtenerPerfil, obtenerTecnologias } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";
import { construirDatosInicio } from "@/lib/datosInicio";

export const generateMetadata = () => metadatosPagina("home", "");

export default async function Inicio() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("home");
  const tp = await getTranslations("pending");
  const tg = await getTranslations("groups");
  const perfil = obtenerPerfil();
  const articulos = listarArticulos().slice(0, 2);
  const ciudad = perfil.ubicacion.split(",")[0];

  const mensaje = enIdioma(perfil.mensaje, idioma);
  const busca = enIdioma(perfil.busca, idioma);
  const desarrollo = enIdioma(perfil.desarrollo, idioma);
  const complementario = enIdioma(perfil.complementario, idioma);
  const { email, github } = perfil.contacto;

  // Tecnologías declaradas por Mario, agrupadas por uso
  const destacadas = obtenerTecnologias().filter((tec) => tec.destacada);
  const grupos = GRUPOS.map((g) => ({ grupo: g, nombres: destacadas.filter((tec) => tec.grupo === g).map((tec) => nombreTecnologia(tec, idioma)) })).filter(
    (g) => g.nombres.length,
  );

  const tproy = await getTranslations("projects");
  const datosInicio = await construirDatosInicio(idioma);
  const seccion = "border-t border-linea";

  return (
    <>
      <DatosEstructurados idioma={idioma} />
      <ProveedorExplorar datos={datosInicio}>
        {/* Presentación y consola */}
        <section className="contenedor grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-center lg:gap-14">
          <div className="flex flex-col gap-6">
            <span className="inline-flex items-center gap-2 text-[13px] text-tenue">
              <span aria-hidden="true" className="size-2 rounded-full bg-exito" />
              {perfil.nombre} · {enIdioma(perfil.rol, idioma)} · {t("status", { ciudad })}
            </span>
            <h1 className="text-[34px] leading-[1.1] font-bold text-balance sm:text-5xl lg:text-[56px]">{t("title")}</h1>
            {mensaje ? <p className="max-w-2xl text-lg leading-relaxed sm:text-xl">{mensaje}</p> : <Pendiente>{tp("field")}</Pendiente>}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Boton href="/projects" flecha>
                {t("ctaProjects")}
              </Boton>
              <Boton href="/contact" variante="secundario">
                {t("ctaContact")}
              </Boton>
              <div className="flex flex-wrap items-center gap-4 sm:ml-2">
                {github && (
                  <a href={github} target="_blank" rel="me noopener" className="inline-flex min-h-11 items-center gap-1 text-[15px] font-medium hover:text-acento">
                    GitHub
                    <Externo />
                  </a>
                )}
                <EnlaceCV />
              </div>
            </div>
            <Link href="/ask" className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-medium text-acento">
              {t("ctaAsk")}
              <Flecha />
            </Link>
          </div>
          <Consola />
        </section>

        {/* Cuadro de conexiones */}
        <section className="contenedor pb-12 md:pb-16">
          <PanelConexiones />
        </section>

        <section className="contenedor pb-12 md:pb-16">
          <aside className="flex flex-col gap-3.5 rounded-2xl border border-linea bg-superficie p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold">{t("lookingFor")}</h2>
            {busca ? <ListaGuion items={busca} className="text-[15px]" /> : <Pendiente>{tp("field")}</Pendiente>}
          </aside>
        </section>

        {/* Proyectos */}
        <section id="proyectos" className="border-t border-linea" aria-labelledby="t-proyectos">
          <div className="contenedor flex flex-col gap-8 py-14 md:py-18">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-2.5">
                <Etiqueta>{t("projectsLabel")}</Etiqueta>
                <h2 id="t-proyectos" className="text-[26px] font-bold sm:text-3xl lg:text-4xl">
                  {tproy("intro")}
                </h2>
              </div>
              <Link href="/projects" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-acento">
                {t("allProjects")}
                <Flecha />
              </Link>
            </div>
            <ListaProyectos />
          </div>
        </section>
      </ProveedorExplorar>

      {/* Lo que aporto */}
      <section className={seccion} aria-labelledby="t-aporto">
        <div className="contenedor flex flex-col gap-9 py-14 md:py-18">
          <div className="flex flex-col gap-2.5">
            <Etiqueta>{t("offerLabel")}</Etiqueta>
            <h2 id="t-aporto" className="max-w-3xl text-[28px] font-semibold tracking-tight sm:text-4xl lg:text-[40px]">
              {t("offerTitle")}
            </h2>
          </div>
          <DiagramaPerfil />
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col gap-3.5 rounded-2xl border border-linea bg-superficie p-6 sm:p-7">
              <h3 className="text-[22px] font-semibold">{t("devTitle")}</h3>
              {desarrollo ? <ListaGuion items={desarrollo} className="text-[15px]" /> : <Pendiente>{tp("field")}</Pendiente>}
            </div>
            <div className="flex flex-col gap-3.5 rounded-2xl bg-chip p-6 sm:p-7">
              <h3 className="text-[22px] font-semibold">
                {t("sysTitle")} <span className="text-[13px] font-normal text-tenue">· {t("sysNote")}</span>
              </h3>
              {complementario ? <ListaGuion items={complementario.slice(0, 4)} className="text-[15px]" /> : <Pendiente>{tp("field")}</Pendiente>}
              <Link href="/about" className="inline-flex min-h-11 items-center text-[15px] font-medium text-acento">
                {t("seeAbout")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tecnologías */}
      <section className={seccion} aria-labelledby="t-tecnologias">
        <div className="contenedor grid gap-8 py-14 md:py-18 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-3.5">
            <Etiqueta>{t("techLabel")}</Etiqueta>
            <h2 id="t-tecnologias" className="text-[28px] font-semibold tracking-tight sm:text-4xl">
              {t("techTitle")}
            </h2>
            <p className="leading-relaxed text-tenue">{t("techText")}</p>
            <Link href="/technologies" className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-acento">
              {t("techLink")}
              <Flecha />
            </Link>
          </div>
          <dl>
            {grupos.map(({ grupo, nombres }) => (
              <div key={grupo} className="grid gap-2 border-b border-linea py-3.5 sm:grid-cols-[160px_1fr] sm:items-baseline sm:gap-4">
                <dt className="font-mono text-[13px] text-tenue">{tg(grupo)}</dt>
                <dd>
                  <Chips items={nombres} />
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Blog */}
      <section className={seccion} aria-labelledby="t-blog">
        <div className="contenedor grid gap-6 py-12 md:py-14 lg:grid-cols-[4fr_7fr] lg:gap-16">
          <div className="flex flex-col gap-3.5">
            <Etiqueta>{t("blogLabel")}</Etiqueta>
            <h2 id="t-blog" className="text-[28px] font-semibold tracking-tight sm:text-4xl">
              {t("blogTitle")}
            </h2>
          </div>
          {articulos.length > 0 ? (
            <div className="flex flex-col gap-4">
              <ul className="grid gap-5 md:grid-cols-2">
                {articulos.map((a) => (
                  <li key={a.slug}>
                    <TarjetaArticulo entrada={a} idioma={idioma} />
                  </li>
                ))}
              </ul>
              <Link href="/blog" className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-medium text-acento">
                {t("blogAll")}
                <Flecha />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col justify-center gap-2.5 rounded-2xl border border-dashed border-linea p-6">
              <span className="text-[17px] font-medium">{t("blogSoon")}</span>
              <span className="text-[15px] text-tenue">{t("blogText")}</span>
            </div>
          )}
        </div>
      </section>

      {/* Contacto */}
      <section className="contenedor pt-4 pb-14 md:pb-18">
        <div className="flex flex-col gap-6 rounded-3xl bg-invertido p-7 text-sobre-invertido sm:p-10 md:flex-row md:items-center md:justify-between lg:p-14">
          <div className="flex flex-col gap-3">
            <h2 className="text-[34px] font-semibold tracking-tight sm:text-5xl lg:text-[52px]">{t.rich("contactTitle", { acento: (x) => x })}</h2>
            {email && (
              <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center text-[15px] sm:text-xl">
                {email}
              </a>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {email && <Boton href="/contact#formulario">{t("contactEmail")}</Boton>}
            {github && (
              <a
                href={github}
                target="_blank"
                rel="me noopener"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-tenue px-5 text-[15px] font-medium hover:border-sobre-invertido"
              >
                GitHub
                <Externo />
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
