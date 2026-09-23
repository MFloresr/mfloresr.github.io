import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

/**
 * Convierte el cuerpo MDX de una ficha o artículo en contenido React.
 * Se ejecuta en el servidor al generar la página estática.
 */
export async function Mdx({ fuente }: { fuente: string }) {
  if (!fuente.trim()) return null;
  const { default: Contenido } = await evaluate(fuente, { ...runtime, baseUrl: import.meta.url });
  return <Contenido />;
}
