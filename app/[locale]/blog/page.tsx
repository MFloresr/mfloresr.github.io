import { getTranslations } from "next-intl/server";
import PaginaProvisional from "@/components/PaginaProvisional";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("blog", "/blog");

export default async function PaginaBlog() {
  const t = await getTranslations();
  return <PaginaProvisional titulo={t("meta.blog.title")} pendiente={t("pending.blog")} />;
}
