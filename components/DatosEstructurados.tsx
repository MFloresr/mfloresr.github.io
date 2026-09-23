import { enIdioma } from "@/lib/contenido/idioma";
import { obtenerPerfil } from "@/lib/contenido/leer";
import { SITE_URL } from "@/lib/sitio";

/**
 * Datos estructurados (schema.org Person) para buscadores: solo datos públicos confirmados.
 * Los perfiles pendientes (null) no se incluyen.
 */
export default function DatosEstructurados({ idioma }: { idioma: string }) {
  const perfil = obtenerPerfil();
  const { email, github, linkedin } = perfil.contacto;
  const [ciudad, region] = perfil.ubicacion.split(",").map((s) => s.trim());

  const datos = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: perfil.nombre,
    url: `${SITE_URL}/${idioma}`,
    jobTitle: enIdioma(perfil.rol, idioma) ?? undefined,
    address: { "@type": "PostalAddress", addressLocality: ciudad, addressRegion: region, addressCountry: "ES" },
    ...(email && { email: `mailto:${email}` }),
    sameAs: [github, linkedin].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      // JSON generado por nosotros; se escapa "<" para que no pueda cerrar la etiqueta
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}
