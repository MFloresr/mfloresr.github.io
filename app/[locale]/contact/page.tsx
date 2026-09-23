import { getTranslations } from "next-intl/server";
import Pendiente from "@/components/Pendiente";
import Boton from "@/components/ui/Boton";
import { obtenerPerfil } from "@/lib/contenido/leer";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("contact", "/contact");

export default async function Contacto() {
  const t = await getTranslations("contact");
  const tm = await getTranslations("meta.contact");
  const tp = await getTranslations("pending");
  const tui = await getTranslations("ui");
  const perfil = obtenerPerfil();
  const { email, github, linkedin } = perfil.contacto;
  const sinProtocolo = (url: string) => url.replace(/^https:\/\/(www\.)?/, "");

  const filas: { etiqueta: string; valor: React.ReactNode }[] = [
    {
      etiqueta: t("email"),
      valor: email ? (
        <a href={`mailto:${email}`} className="font-mono text-base hover:text-acento">
          {email}
        </a>
      ) : (
        <Pendiente>{tp("field")}</Pendiente>
      ),
    },
    {
      etiqueta: t("github"),
      valor: github ? (
        <a href={github} target="_blank" rel="me noopener" className="text-base hover:text-acento">
          {sinProtocolo(github)}
        </a>
      ) : (
        <Pendiente>{tp("field")}</Pendiente>
      ),
    },
    {
      etiqueta: t("linkedin"),
      valor: linkedin ? (
        <a href={linkedin} target="_blank" rel="me noopener" className="text-base hover:text-acento">
          {sinProtocolo(linkedin)}
        </a>
      ) : (
        <Pendiente>{tp("field")}</Pendiente>
      ),
    },
    { etiqueta: t("cv"), valor: <Pendiente>{tui("cvPending")}</Pendiente> },
    { etiqueta: t("location"), valor: <span className="text-base">{perfil.ubicacion}</span> },
  ];

  return (
    <div className="contenedor grid gap-10 py-14 md:py-18 lg:grid-cols-[5fr_6fr] lg:gap-18">
      <header className="flex flex-col gap-5">
        <h1 className="text-[44px] font-semibold tracking-[-0.03em] sm:text-6xl">{tm("title")}</h1>
        <p className="text-lg leading-relaxed text-tenue sm:text-xl">{t("intro")}</p>
        {email && (
          <Boton href={`mailto:${email}`} className="w-full sm:w-fit">
            {t("emailButton")}
          </Boton>
        )}
      </header>
      <dl>
        {filas.map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="flex flex-col gap-1.5 border-b border-linea py-4">
            <dt className="font-mono text-xs text-tenue">{etiqueta}</dt>
            <dd>{valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
