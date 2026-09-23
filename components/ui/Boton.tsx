import { Link } from "@/i18n/navigation";
import { Externo, Flecha } from "./Iconos";

type Props = {
  href: string;
  children: React.ReactNode;
  variante?: "primario" | "secundario";
  /** Enlace a otro sitio: se abre en otra pestaña y muestra el icono. */
  externo?: boolean;
  flecha?: boolean;
  className?: string;
};

const estilos = {
  primario: "border-acento bg-acento text-sobre-acento hover:opacity-90",
  secundario: "border-linea text-texto hover:border-texto",
};

/** Botón-enlace. Internos con Link (mantiene el idioma); externos y mailto con <a>. */
export default function Boton({ href, children, variante = "primario", externo, flecha, className = "" }: Props) {
  const clases = `inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border px-5 text-[15px] font-medium transition ${estilos[variante]} ${className}`;
  const contenido = (
    <>
      {children}
      {flecha && <Flecha />}
      {externo && <Externo />}
    </>
  );
  if (externo || href.startsWith("mailto:")) {
    return (
      <a href={href} className={clases} {...(externo && { target: "_blank", rel: "noopener" })}>
        {contenido}
      </a>
    );
  }
  return (
    <Link href={href} className={clases}>
      {contenido}
    </Link>
  );
}
