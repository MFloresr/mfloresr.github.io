import { getTranslations } from "next-intl/server";
import { CONTACTO, NOMBRE } from "@/lib/sitio";

export default async function Pie() {
  const t = await getTranslations("footer");
  const tp = await getTranslations("pending");

  const enlaces = [
    { clave: "email", url: CONTACTO.email ? `mailto:${CONTACTO.email}` : null },
    { clave: "linkedin", url: CONTACTO.linkedin },
    { clave: "github", url: CONTACTO.github },
  ] as const;

  return (
    <footer className="border-t border-linea">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold">{NOMBRE}</span> <span className="text-tenue">· {t("role")}</span>
        </p>
        <ul aria-label={t("links")} className="flex flex-wrap gap-4">
          {enlaces.map(({ clave, url }) => (
            <li key={clave}>
              {url ? (
                <a href={url} className="text-tenue hover:text-texto" {...(clave !== "email" && { rel: "me noopener", target: "_blank" })}>
                  {t(clave)}
                </a>
              ) : (
                <span className="text-pendiente-texto" title={tp("contact")}>
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
