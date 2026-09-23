import type { IdiomaContenido } from "./esquemas";

/** Valor de un campo traducible en un idioma; null si está pendiente. */
export function enIdioma<T>(valor: Partial<Record<IdiomaContenido, T | null>>, idioma: string): T | null {
  return valor[idioma as IdiomaContenido] ?? null;
}
