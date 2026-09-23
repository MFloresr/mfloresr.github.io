import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  esquemaArticulo,
  esquemaDatosProyecto,
  esquemaPerfil,
  esquemaTecnologias,
  esquemaTextoProyecto,
  type Articulo,
  type DatosProyecto,
  type IdiomaContenido,
  type Perfil,
  type Tecnologia,
  type TextoProyecto,
} from "./esquemas";

/**
 * Lectura del contenido de content/ (solo en el servidor y al compilar).
 * Los errores indican el archivo y el campo exactos para corregirlos rápido.
 * Usa rutas relativas (sin "@/") para poder ejecutarse también desde scripts/.
 */

const RAIZ = path.join(process.cwd(), "content");

class ContenidoInvalido extends Error {}

function validar<T>(esquema: z.ZodType<T>, datos: unknown, archivo: string): T {
  const resultado = esquema.safeParse(datos);
  if (!resultado.success) {
    throw new ContenidoInvalido(
      `Contenido no válido en ${path.relative(process.cwd(), archivo)}:\n${z.prettifyError(resultado.error)}`,
    );
  }
  return resultado.data;
}

function leerYaml(archivo: string): unknown {
  try {
    return parseYaml(readFileSync(archivo, "utf-8"));
  } catch (e) {
    throw new ContenidoInvalido(`YAML no válido en ${path.relative(process.cwd(), archivo)}: ${(e as Error).message}`);
  }
}

/** Separa el frontmatter (entre líneas ---) del cuerpo MDX. */
function separarFrontmatter(archivo: string): { datos: unknown; cuerpo: string } {
  const texto = readFileSync(archivo, "utf-8");
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new ContenidoInvalido(`Falta el frontmatter (--- ... ---) en ${path.relative(process.cwd(), archivo)}`);
  try {
    return { datos: parseYaml(m[1]), cuerpo: m[2].trim() };
  } catch (e) {
    throw new ContenidoInvalido(`Frontmatter no válido en ${path.relative(process.cwd(), archivo)}: ${(e as Error).message}`);
  }
}

// ---------- Tecnologías y perfil ----------

let tecnologias: Tecnologia[] | undefined;
export function obtenerTecnologias(): Tecnologia[] {
  const archivo = path.join(RAIZ, "tecnologias.yaml");
  tecnologias ??= validar(esquemaTecnologias, leerYaml(archivo), archivo);
  return tecnologias;
}

let perfil: Perfil | undefined;
export function obtenerPerfil(): Perfil {
  const archivo = path.join(RAIZ, "perfil.yaml");
  perfil ??= validar(esquemaPerfil, leerYaml(archivo), archivo);
  return perfil;
}

// ---------- Proyectos ----------

export type TextoIdioma = { datos: TextoProyecto; cuerpo: string };
export type Proyecto = {
  slug: string;
  datos: DatosProyecto;
  /** Texto por idioma; si falta un idioma, esa traducción está pendiente. */
  textos: Partial<Record<IdiomaContenido, TextoIdioma>>;
};

const DIR_PROYECTOS = path.join(RAIZ, "proyectos");

export function listarSlugsProyectos(): string[] {
  return readdirSync(DIR_PROYECTOS, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

const cacheProyectos = new Map<string, Proyecto>();

export function obtenerProyecto(slug: string): Proyecto | null {
  if (cacheProyectos.has(slug)) return cacheProyectos.get(slug)!;
  const dir = path.join(DIR_PROYECTOS, slug);
  const archivoDatos = path.join(dir, "proyecto.yaml");
  if (!existsSync(archivoDatos)) return null;

  const datos = validar(esquemaDatosProyecto, leerYaml(archivoDatos), archivoDatos);

  // Cada tecnología citada debe existir en el catálogo
  const ids = new Set(obtenerTecnologias().map((t) => t.id));
  const desconocidas = datos.tecnologias.filter((t) => !ids.has(t));
  if (desconocidas.length) {
    throw new ContenidoInvalido(
      `Tecnologías que no están en content/tecnologias.yaml (${path.relative(process.cwd(), archivoDatos)}): ${desconocidas.join(", ")}`,
    );
  }

  // Cada captura debe existir en public/proyectos/<slug>/
  const faltan = datos.capturas.filter((c) => !existsSync(path.join(process.cwd(), "public", "proyectos", slug, c.archivo)));
  if (faltan.length) {
    throw new ContenidoInvalido(
      `Capturas que no están en public/proyectos/${slug}/ (${path.relative(process.cwd(), archivoDatos)}): ${faltan.map((c) => c.archivo).join(", ")}`,
    );
  }

  const textos: Proyecto["textos"] = {};
  for (const archivo of readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const idioma = archivo.replace(/\.mdx$/, "");
    if (!["es", "en", "ca", "fr"].includes(idioma)) {
      throw new ContenidoInvalido(`Idioma desconocido en el nombre del archivo: ${path.join("content/proyectos", slug, archivo)}`);
    }
    const ruta = path.join(dir, archivo);
    const { datos: frontmatter, cuerpo } = separarFrontmatter(ruta);
    textos[idioma as IdiomaContenido] = { datos: validar(esquemaTextoProyecto, frontmatter, ruta), cuerpo };
  }
  if (!textos.es) {
    throw new ContenidoInvalido(`Falta la versión en castellano: content/proyectos/${slug}/es.mdx`);
  }

  const proyecto = { slug, datos, textos };
  cacheProyectos.set(slug, proyecto);
  return proyecto;
}

/** Todos los proyectos, ordenados por el campo `orden`. */
export function listarProyectos(): Proyecto[] {
  return listarSlugsProyectos()
    .map((slug) => obtenerProyecto(slug)!)
    .sort((a, b) => a.datos.orden - b.datos.orden);
}

/**
 * Proyectos donde se usa una tecnología (directamente o a través de las que "incluye"),
 * en el orden de los proyectos. Se calcula del contenido: nunca se escribe a mano.
 */
export function proyectosQueUsan(idTecnologia: string): Proyecto[] {
  const tecnologia = obtenerTecnologias().find((t) => t.id === idTecnologia);
  const ids = new Set([idTecnologia, ...(tecnologia?.incluye ?? [])]);
  return listarProyectos().filter((p) => p.datos.tecnologias.some((t) => ids.has(t)));
}

// ---------- Blog ----------

export type ArticuloIdioma = { datos: Articulo; cuerpo: string; minutos: number };
export type EntradaBlog = {
  slug: string;
  /** Versiones por idioma que existen (y se pueden publicar en este entorno). */
  textos: Partial<Record<IdiomaContenido, ArticuloIdioma>>;
};

const DIR_BLOG = path.join(RAIZ, "blog");

/** Los borradores solo se muestran fuera de producción (local o vistas previas de Vercel). */
export function mostrarBorradores(): boolean {
  return process.env.VERCEL_ENV !== "production" && process.env.OCULTAR_BORRADORES !== "1";
}

/** Minutos de lectura aproximados (unas 200 palabras por minuto, sin contar el código). */
function minutosLectura(cuerpo: string): number {
  const sinCodigo = cuerpo.replace(/```[\s\S]*?```/g, " ");
  const palabras = sinCodigo.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palabras / 200));
}

let cacheBlog: EntradaBlog[] | undefined;

/** Artículos publicables en este entorno, del más reciente al más antiguo. */
export function listarArticulos(): EntradaBlog[] {
  if (cacheBlog) return cacheBlog;
  const slugsProyectos = new Set(listarSlugsProyectos());
  const entradas: EntradaBlog[] = [];
  if (existsSync(DIR_BLOG)) {
    for (const dir of readdirSync(DIR_BLOG, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      const textos: EntradaBlog["textos"] = {};
      for (const archivo of readdirSync(path.join(DIR_BLOG, dir.name)).filter((f) => f.endsWith(".mdx"))) {
        const idioma = archivo.replace(/\.mdx$/, "");
        const ruta = path.join(DIR_BLOG, dir.name, archivo);
        if (!["es", "en", "ca", "fr"].includes(idioma)) {
          throw new ContenidoInvalido(`Idioma desconocido en el nombre del archivo: ${path.relative(process.cwd(), ruta)}`);
        }
        const { datos: frontmatter, cuerpo } = separarFrontmatter(ruta);
        const datos = validar(esquemaArticulo, frontmatter, ruta);
        const desconocidos = datos.proyectos.filter((p) => !slugsProyectos.has(p));
        if (desconocidos.length) {
          throw new ContenidoInvalido(`Proyectos relacionados que no existen (${path.relative(process.cwd(), ruta)}): ${desconocidos.join(", ")}`);
        }
        if (datos.borrador && !mostrarBorradores()) continue;
        textos[idioma as IdiomaContenido] = { datos, cuerpo, minutos: minutosLectura(cuerpo) };
      }
      if (Object.keys(textos).length) entradas.push({ slug: dir.name, textos });
    }
  }
  const fecha = (e: EntradaBlog) => Object.values(e.textos)[0]!.datos.fecha;
  cacheBlog = entradas.sort((a, b) => fecha(b).localeCompare(fecha(a)));
  return cacheBlog;
}

/** Versión de un artículo para un idioma: la suya o, si falta, la primera que exista. */
export function textoArticulo(entrada: EntradaBlog, idioma: IdiomaContenido) {
  const propio = entrada.textos[idioma];
  if (propio) return { texto: propio, idioma, traducido: true };
  const [otroIdioma, texto] = Object.entries(entrada.textos)[0] as [IdiomaContenido, ArticuloIdioma];
  return { texto, idioma: otroIdioma, traducido: false };
}
