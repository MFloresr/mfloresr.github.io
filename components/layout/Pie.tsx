import { getLocale, getTranslations } from "next-intl/server";
import Pendiente from "@/components/Pendiente";
import { enIdioma } from "@/lib/contenido/idioma";
import { obtenerPerfil } from "@/lib/contenido/leer";

export default async function Pie() {
  const t = await getTranslations("footer");
  const tp = await getTranslations("pending");
  const perfil = obtenerPerfil();
  const rol = enIdioma(perfil.rol, await getLocale());
  const { email, linkedin, github } = perfil.contacto;

  const enlaces = [
    { clave: "email", url: email ? `mailto:${email}` : null },
    { clave: "github", url: github },
    { clave: "linkedin", url: linkedin },
  ] as const;

  return (
    <footer className="border-t border-linea">
      <div className="contenedor flex flex-col gap-4 py-8 text-sm md:flex-row md:items-center md:justify-between">
        <p>
          <strong className="font-semibold">{perfil.nombre}</strong>{" "}
          <span className="text-tenue">
            · {rol ?? tp("label")} · {perfil.ubicacion.split(",")[0]}
          </span>
        </p>
        <ul aria-label={t("links")} className="flex flex-wrap items-center gap-5">
          {enlaces.map(({ clave, url }) => (
            <li key={clave}>
              {url ? (
                <a href={url} className="text-tenue hover:text-texto" {...(clave !== "email" && { rel: "me noopener", target: "_blank" })}>
                  {t(clave)}
                </a>
              ) : (
                <Pendiente>{t(clave)}</Pendiente>
              )}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
