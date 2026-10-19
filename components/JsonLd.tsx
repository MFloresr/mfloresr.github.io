/** Inserta un bloque de datos estructurados (JSON-LD) en la página. */
export default function JsonLd({ datos }: { datos: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON generado por nosotros; se escapa "<" para que no pueda cerrar la etiqueta
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\u003c") }}
    />
  );
}

/** Migas de pan (schema.org BreadcrumbList). */
export function migas(items: { nombre: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nombre, item: it.url })),
  };
}
