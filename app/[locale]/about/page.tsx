import { getLocale, getTranslations } from "next-intl/server";
import Pendiente from "@/components/Pendiente";
import { ListaGuion } from "@/components/ui/Basicos";
import { Flecha } from "@/components/ui/Iconos";
import { Link } from "@/i18n/navigation";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { enIdioma } from "@/lib/contenido/idioma";
import { obtenerPerfil } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("about", "/about");

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5">
      <h2 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">{titulo}</h2>
      {children}
    </section>
  );
}

export default async function SobreMi() {
  const idioma = (await getLocale()) as IdiomaContenido;
  const t = await getTranslations("about");
  const tp = await getTranslations("pending");
  const tui = await getTranslations("ui");
  const perfil = obtenerPerfil();
  const pendiente = <Pendiente>{tp("field")}</Pendiente>;

  const mensaje = enIdioma(perfil.mensaje, idioma);
  const busca = enIdioma(perfil.busca, idioma);
  const desarrollo = enIdioma(perfil.desarrollo, idioma);
  const intro = enIdioma(perfil.complementarioIntro, idioma);
  const complementario = enIdioma(perfil.complementario, idioma);
  const { email } = perfil.contacto;

  return (
    <div className="contenedor grid gap-12 py-14 md:py-18 lg:grid-cols-[4fr_8fr] lg:gap-18">
      <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-col gap-1">
          <strong className="text-lg font-semibold">{perfil.nombre}</strong>
          <span className="font-mono text-[13px] text-tenue">{perfil.ubicacion}</span>
        </div>
        <div className="flex flex-col items-start gap-2.5">
          <Pendiente>{tui("cvPending")}</Pendiente>
          {email && (
            <a href={`mailto:${email}`} className="text-[15px] font-medium text-acento">
              {email}
            </a>
          )}
        </div>
      </aside>

      <div className="flex flex-col gap-12">
        <header className="flex flex-col gap-4.5">
          <h1 className="text-[44px] font-semibold tracking-[-0.03em] sm:text-6xl">{t("intro")}</h1>
          {mensaje ? <p className="text-lg leading-normal sm:text-[22px]">{mensaje}</p> : pendiente}
        </header>

        <Seccion titulo={t("lookingFor")}>{busca ? <ListaGuion items={busca} className="text-[17px]" /> : pendiente}</Seccion>

        <Seccion titulo={t("development")}>
          {desarrollo ? <ListaGuion items={desarrollo} className="text-[17px]" /> : pendiente}
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-[15px] font-medium text-acento">
            {t("projectsLink")}
            <Flecha />
          </Link>
        </Seccion>

        <Seccion titulo={t("education")}>
          <ul className="border-y border-linea">
            {perfil.formacion.map((f, i) => {
              const titulo = enIdioma(f.titulo, idioma);
              return (
                <li key={i} className="grid gap-2 py-4.5 sm:grid-cols-[180px_1fr] sm:gap-4">
                  <span>{f.fechas ?? <Pendiente>{tp("dates")}</Pendiente>}</span>
                  <div className="flex flex-col items-start gap-2">
                    {titulo ? <strong className="text-[17px] font-semibold">{titulo}</strong> : pendiente}
                    {f.centro ? <span className="text-tenue">{f.centro}</span> : <Pendiente>{tp("school")}</Pendiente>}
                  </div>
                </li>
              );
            })}
          </ul>
        </Seccion>

        <Seccion titulo={t("systems")}>
          {intro ? <p className="text-[17px] leading-relaxed text-tenue">{intro}</p> : pendiente}
          {complementario ? (
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {complementario.map((item) => (
                <li key={item} className="flex gap-2.5 border-b border-linea py-3 leading-normal">
                  <span aria-hidden="true" className="text-acento">
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            pendiente
          )}
        </Seccion>
      </div>
    </div>
  );
}
