import Image from "next/image";

/** Imagen de un artículo con pie opcional. El tamaño real evita saltos de maquetación al cargar. */
export default function Figura({ src, alt, ancho, alto, pie }: { src: string; alt: string; ancho: number; alto: number; pie?: string }) {
  return (
    <figure className="figura">
      <Image src={src} alt={alt} width={ancho} height={alto} sizes="(min-width: 1024px) 768px, 100vw" />
      {pie && <figcaption>{pie}</figcaption>}
    </figure>
  );
}
