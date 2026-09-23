import { getTranslations } from "next-intl/server";
import PaginaProvisional from "@/components/PaginaProvisional";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("projects", "/projects");

export default async function PaginaProjects() {
  const t = await getTranslations();
  return <PaginaProvisional titulo={t("meta.projects.title")} pendiente={t("pending.projects")} />;
}
