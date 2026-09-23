import type { DatosProyecto, IdiomaContenido, Tecnologia } from "./esquemas";

/** Valor de un campo traducible en un idioma; null si está pendiente. */
export function enIdioma<T>(valor: Partial<Record<IdiomaContenido, T | null>>, idioma: string): T | null {
  return valor[idioma as IdiomaContenido] ?? null;
}

/** Nombre de una tecnología en un idioma; si no está traducido, el castellano. */
export function nombreTecnologia(tec: Tecnologia, idioma: string): string {
  return typeof tec.nombre === "string" ? tec.nombre : (enIdioma(tec.nombre, idioma) ?? tec.nombre.es!);
}

/** Capturas de un proyecto con el texto alternativo en un idioma (o en castellano si falta). */
export function capturasEnIdioma(datos: DatosProyecto, idioma: string) {
  return datos.capturas.map((c) => ({ ...c, alt: enIdioma(c.alt, idioma) ?? c.alt.es! }));
}
