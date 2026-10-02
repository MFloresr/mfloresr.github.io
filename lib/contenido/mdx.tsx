import { evaluate } from "@mdx-js/mdx";
import { getTranslations } from "next-intl/server";
import { isValidElement, type ReactNode } from "react";
import * as runtime from "react/jsx-runtime";
import rehypePrettyCode from "rehype-pretty-code";
import BloqueCodigo from "@/components/blog/BloqueCodigo";

/** Texto plano de un nodo de React (para sacar el identificador de un título). */
function textoDe(nodo: ReactNode): string {
  if (typeof nodo === "string" || typeof nodo === "number") return String(nodo);
  if (Array.isArray(nodo)) return nodo.map(textoDe).join("");
  if (isValidElement(nodo)) return textoDe((nodo.props as { children?: ReactNode }).children);
  return "";
}

/** Identificador de un título: minúsculas, sin acentos y con guiones ("Qué es X" → "que-es-x"). */
export function slugificar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type EntradaIndice = { id: string; texto: string; nivel: 2 | 3 };

/** Títulos de nivel 2 y 3 de un cuerpo MDX, en orden, para el índice del artículo. */
export function extraerIndice(cuerpo: string): EntradaIndice[] {
  const indice: EntradaIndice[] = [];
  let enCodigo = false;
  for (const linea of cuerpo.split("\n")) {
    if (/^\s*```/.test(linea)) enCodigo = !enCodigo;
    if (enCodigo) continue;
    const m = linea.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const texto = m[2].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[`*_]/g, "");
    indice.push({ id: slugificar(texto), texto, nivel: m[1].length as 2 | 3 });
  }
  return indice;
}

/**
 * Convierte el cuerpo MDX de una ficha o artículo en contenido React.
 * Se ejecuta en el servidor al generar la página estática; el resaltado de código
 * (Shiki) también se hace aquí, así que no añade JavaScript en el navegador.
 * Los títulos llevan identificador (para el índice) y los bloques de código, un botón de copiar.
 */
export async function Mdx({ fuente }: { fuente: string }) {
  if (!fuente.trim()) return null;
  const t = await getTranslations("article");
  const { default: Contenido } = await evaluate(fuente, {
    ...runtime,
    baseUrl: import.meta.url,
    rehypePlugins: [[rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark" }, keepBackground: false }]],
  });
  const componentes = {
    h2: (props: React.ComponentProps<"h2">) => <h2 id={slugificar(textoDe(props.children))} {...props} />,
    h3: (props: React.ComponentProps<"h3">) => <h3 id={slugificar(textoDe(props.children))} {...props} />,
    pre: (props: React.ComponentProps<"pre">) => (
      <BloqueCodigo textos={{ copiar: t("copy"), copiado: t("copied"), etiqueta: t("copyCode") }}>
        <pre {...props} />
      </BloqueCodigo>
    ),
  };
  return <Contenido components={componentes} />;
}
