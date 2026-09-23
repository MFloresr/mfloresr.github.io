import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";
import {
  esquemaDatosProyecto,
  esquemaPerfil,
  esquemaTecnologias,
  esquemaTextoProyecto,
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
