import PaginaLegal, { metadatosLegal } from "@/components/PaginaLegal";

export const generateMetadata = () => metadatosLegal("legal");

export default function Pagina() {
  return <PaginaLegal pagina="legal" />;
}
