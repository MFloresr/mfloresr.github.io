import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypePrettyCode from "rehype-pretty-code";

/**
 * Convierte el cuerpo MDX de una ficha o artículo en contenido React.
 * Se ejecuta en el servidor al generar la página estática; el resaltado de código
 * (Shiki) también se hace aquí, así que no añade JavaScript en el navegador.
 */
export async function Mdx({ fuente }: { fuente: string }) {
  if (!fuente.trim()) return null;
  const { default: Contenido } = await evaluate(fuente, {
    ...runtime,
    baseUrl: import.meta.url,
    rehypePlugins: [[rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false }]],
  });
  return <Contenido />;
}
