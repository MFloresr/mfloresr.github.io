import { z } from "zod";

/**
 * Esquemas del contenido. Todo lo que hay en content/ se valida con estos esquemas
 * al compilar: un campo mal escrito o con un tipo incorrecto rompe el build.
 * `null` significa "pendiente de confirmar" y se muestra como tal, nunca se inventa.
 */

const IDIOMAS_CONTENIDO = ["es", "en", "ca", "fr"] as const;
export type IdiomaContenido = (typeof IDIOMAS_CONTENIDO)[number];

/** Un valor con una versión por idioma. Falta o null = pendiente en ese idioma. */
export function traducible<T extends z.ZodType>(valor: T) {
  return z
    .object(Object.fromEntries(IDIOMAS_CONTENIDO.map((i) => [i, valor.nullable().optional()])) as Record<IdiomaContenido, z.ZodOptional<z.ZodNullable<T>>>)
    .strict();
}

const texto = z.string().trim().min(1);
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "solo minúsculas, números y guiones");

export const GRUPOS = ["backend", "frontend", "datos", "infraestructura", "herramientas", "ia"] as const;

export const esquemaTecnologia = z
  .object({
    id: slug,
    /** Nombre propio (igual en todos los idiomas) o una versión por idioma si se traduce. */
    nombre: z.union([texto, traducible(texto)]),
    grupo: z.enum(GRUPOS),
    destacada: z.boolean(),
    /** Otras tecnologías que cuentan como uso de esta (p. ej. Bases de datos → PostgreSQL). */
    incluye: z.array(slug).optional(),
    /** Dónde la usa cuando no aparece en ningún proyecto. */
    contexto: traducible(texto).optional(),
  })
  .strict();
export const esquemaTecnologias = z.array(esquemaTecnologia).superRefine((lista, ctx) => {
  const ids = new Set(lista.map((t) => t.id));
  const vistos = new Set<string>();
  for (const t of lista) {
    if (vistos.has(t.id)) ctx.addIssue({ code: "custom", message: `id repetido: ${t.id}` });
    vistos.add(t.id);
    for (const otra of t.incluye ?? []) {
      if (!ids.has(otra)) ctx.addIssue({ code: "custom", message: `${t.id}.incluye cita una tecnología que no existe: ${otra}` });
    }
  }
});

export const esquemaPerfil = z
  .object({
    nombre: texto,
    ubicacion: texto,
    rol: traducible(texto),
    mensaje: traducible(texto),
    contacto: z
      .object({
        email: z.email().nullable(),
        linkedin: z.url({ protocol: /^https$/ }).nullable(),
        github: z.url({ protocol: /^https$/ }).nullable(),
      })
      .strict(),
    resumen: traducible(texto),
    experiencia: z.array(
      z
        .object({
          puesto: traducible(texto),
          empresa: texto,
          fechas: traducible(texto),
          tareas: traducible(z.array(texto).min(1)),
        })
        .strict(),
    ),
    formacion: z.array(
      z.object({ titulo: traducible(texto), centro: texto.nullable(), fechas: texto.nullable() }).strict(),
    ),
    certificaciones: traducible(z.array(texto).min(1)),
    idiomas: traducible(z.array(texto).min(1)),
    competencias: traducible(z.array(texto).min(1)),
    busca: traducible(z.array(texto).min(1)),
    desarrollo: traducible(z.array(texto).min(1)),
    /** Cómo usa la IA al desarrollar (declarado por Mario). */
    asistenciaIA: traducible(texto),
    complementarioIntro: traducible(texto),
    complementario: traducible(z.array(texto).min(1)),
  })
  .strict();

export const ESTADOS = ["produccion", "terminado", "en-desarrollo"] as const;

/** Datos comunes de un proyecto (content/proyectos/<slug>/proyecto.yaml). */
export const esquemaDatosProyecto = z
  .object({
    orden: z.number().int().positive(),
    destacado: z.boolean(),
    estado: z.enum(ESTADOS),
    anio: z.number().int().min(2000).max(2100),
    tecnologias: z.array(slug).min(1),
    repositorio: z.url({ protocol: /^https$/ }).nullable(),
    demo: z
      .object({ url: z.url({ protocol: /^https$/ }), requiereCuenta: z.boolean() })
      .strict()
      .nullable(),
    /**
     * Capturas en public/proyectos/<slug>/ (hechas con datos de demostración).
     * La primera es la principal (escritorio); `movil: true` marca las de móvil.
     */
    capturas: z.array(z.object({ archivo: texto, alt: traducible(texto), movil: z.boolean().optional() }).strict()),
  })
  .strict();

/** Textos de un proyecto en un idioma (frontmatter de content/proyectos/<slug>/<idioma>.mdx). */
export const esquemaTextoProyecto = z
  .object({
    revisado: z.boolean(),
    titulo: texto,
    resumen: texto,
    contexto: texto.nullable(),
    objetivo: texto.nullable(),
    problema: texto.nullable(),
    usuario: texto.nullable(),
    estadoTexto: texto.nullable(),
    funcionalidades: z.array(texto).min(1).nullable(),
    retos: z.array(z.object({ titulo: texto, texto: texto }).strict()).min(1).nullable(),
    mejoras: z.array(texto).min(1).nullable(),
    /** Diagrama de arquitectura: 2 a 4 piezas en orden y una nota opcional. */
    arquitectura: z
      .object({
        nodos: z
          .array(z.object({ titulo: texto, detalle: texto, destacado: z.boolean().optional() }).strict())
          .min(2)
          .max(4),
        nota: texto.nullable(),
      })
      .strict()
      .nullable(),
  })
  .strict();

export type Tecnologia = z.infer<typeof esquemaTecnologia>;
export type Perfil = z.infer<typeof esquemaPerfil>;
export type DatosProyecto = z.infer<typeof esquemaDatosProyecto>;
export type TextoProyecto = z.infer<typeof esquemaTextoProyecto>;

// ---------- Blog ----------

export const CATEGORIAS = ["proyectos", "desarrollo", "sistemas", "despliegue", "ia"] as const;

/** Frontmatter de un artículo (content/blog/<slug>/<idioma>.mdx). */
export const esquemaArticulo = z
  .object({
    /** Borradores: se ven en local y en las vistas previas de Vercel, nunca en producción. */
    borrador: z.boolean(),
    titulo: texto,
    resumen: texto,
    fecha: z.iso.date(),
    actualizado: z.iso.date().nullable().optional(),
    categoria: z.enum(CATEGORIAS),
    etiquetas: z.array(slug).max(8),
    destacado: z.boolean(),
    portada: z.object({ archivo: texto, alt: texto }).strict().nullable().optional(),
    /** Slugs de proyectos relacionados (se comprueba que existan). */
    proyectos: z.array(slug),
  })
  .strict();

export type Articulo = z.infer<typeof esquemaArticulo>;
