import { getTranslations } from "next-intl/server";
import PaginaProvisional from "@/components/PaginaProvisional";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("about", "/about");

export default async function PaginaAbout() {
  const t = await getTranslations();
  return <PaginaProvisional titulo={t("meta.about.title")} pendiente={t("pending.about")} />;
}
