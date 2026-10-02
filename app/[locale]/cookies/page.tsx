import PaginaLegal, { metadatosLegal } from "@/components/PaginaLegal";

export const generateMetadata = () => metadatosLegal("cookies");

export default function Pagina() {
  return <PaginaLegal pagina="cookies" />;
}
