import { getTranslations } from "next-intl/server";
import PaginaProvisional from "@/components/PaginaProvisional";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("technologies", "/technologies");

export default async function PaginaTechnologies() {
  const t = await getTranslations();
  return <PaginaProvisional titulo={t("meta.technologies.title")} pendiente={t("pending.technologies")} />;
}
