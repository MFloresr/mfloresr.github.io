import { getLocale, getTranslations } from "next-intl/server";
import { obtenerPerfil } from "@/lib/contenido/leer";
import { enIdioma } from "@/lib/contenido/idioma";

export default async function Pie() {
  const t = await getTranslations("footer");
  const tp = await getTranslations("pending");
  const perfil = obtenerPerfil();
  const rol = enIdioma(perfil.rol, await getLocale());
  const { email, linkedin, github } = perfil.contacto;

  const enlaces = [
    { clave: "email", url: email ? `mailto:${email}` : null },
    { clave: "linkedin", url: linkedin },
    { clave: "github", url: github },
  ] as const;

  return (
    <footer className="border-t border-linea">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold">{perfil.nombre}</span>{" "}
          <span className="text-tenue">
            · {rol ?? tp("label")} · {perfil.ubicacion.split(",")[0]}
          </span>
        </p>
        <ul aria-label={t("links")} className="flex flex-wrap gap-4">
          {enlaces.map(({ clave, url }) => (
            <li key={clave}>
              {url ? (
                <a href={url} className="text-tenue hover:text-texto" {...(clave !== "email" && { rel: "me noopener", target: "_blank" })}>
                  {t(clave)}
                </a>
              ) : (
                <span className="text-pendiente-texto" title={tp("contactDetail")}>
                  {t(clave)} · {tp("label")}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
