import { getTranslations } from "next-intl/server";
import PaginaProvisional from "@/components/PaginaProvisional";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("home", "");

export default async function Inicio() {
  const t = await getTranslations();
  return <PaginaProvisional titulo={t("meta.home.title")} pendiente={t("pending.home")} />;
}
