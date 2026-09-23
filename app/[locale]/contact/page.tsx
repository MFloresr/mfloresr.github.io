import { getTranslations } from "next-intl/server";
import PaginaProvisional from "@/components/PaginaProvisional";
import { metadatosPagina } from "@/lib/metadatos";

export const generateMetadata = () => metadatosPagina("contact", "/contact");

export default async function PaginaContact() {
  const t = await getTranslations();
  return <PaginaProvisional titulo={t("meta.contact.title")} pendiente={t("pending.contact")} />;
}
