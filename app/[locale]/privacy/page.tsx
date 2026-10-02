import PaginaLegal, { metadatosLegal } from "@/components/PaginaLegal";

export const generateMetadata = () => metadatosLegal("privacy");

export default function Pagina() {
  return <PaginaLegal pagina="privacy" />;
}
