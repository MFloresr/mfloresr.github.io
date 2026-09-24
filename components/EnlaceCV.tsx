import { getLocale, getTranslations } from "next-intl/server";
import { Descargar } from "@/components/ui/Iconos";
import { CV_PDF } from "@/lib/sitio";
import type { Idioma } from "@/i18n/routing";

/**
 * Enlace de descarga del CV en PDF del idioma actual. Los PDF se generan con `npm run cv`
 * (cv/plantilla.html + cv/datos.js → public/cv/).
 */
export default async function EnlaceCV({ className = "" }: { className?: string }) {
  const idioma = (await getLocale()) as Idioma;
  const t = await getTranslations("ui");
  return (
    <a
      href={CV_PDF[idioma]}
      download
      className={`inline-flex items-center gap-1.5 text-[15px] font-medium hover:text-acento ${className}`}
    >
      {t("cvDownload")}
      <Descargar />
    </a>
  );
}
