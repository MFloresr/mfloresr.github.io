"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/** Enlaces a la misma página en los otros idiomas. */
export default function SelectorIdioma() {
  const t = useTranslations("language");
  const idioma = useLocale();
  const ruta = usePathname();
  const params = useParams();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1 text-sm">
      {routing.locales.map((codigo) => (
        <Link
          key={codigo}
          // @ts-expect-error ruta con parámetros dinámicos: se reutilizan los de la página actual
          href={{ pathname: ruta, params }}
          locale={codigo}
          hrefLang={codigo}
          lang={codigo}
          aria-current={codigo === idioma ? "true" : undefined}
          title={t(codigo)}
          className={`rounded-md px-2 py-1.5 font-mono text-xs uppercase ${
            codigo === idioma ? "bg-chip text-texto" : "text-tenue hover:text-texto"
          }`}
        >
          {codigo}
        </Link>
      ))}
    </nav>
  );
}
