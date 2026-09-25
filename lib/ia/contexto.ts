import { readFileSync } from "node:fs";
import path from "node:path";
import type { IdiomaContenido } from "../contenido/esquemas";
import { enIdioma, nombreTecnologia } from "../contenido/idioma";
import { listarArticulos, listarProyectos, obtenerPerfil, obtenerTecnologias, proyectosQueUsan } from "../contenido/leer";

/**
 * Ficha de Mario en texto plano para la IA, construida SOLO con el contenido publicado
 * en content/. Es la única fuente que la IA puede usar: si algo no está aquí, no lo sabe.
 * Se escribe en castellano; la IA responde en el idioma de la persona que pregunta.
 */

let cache: string | undefined;

const lista = (items: string[] | null | undefined) => (items?.length ? items.map((i) => `- ${i}`).join("\n") : "- (sin datos)");

export function contextoPerfil(): string {
  if (cache) return cache;
  const es: IdiomaContenido = "es";
  const perfil = obtenerPerfil();
  const partes: string[] = [];

  partes.push(`# ${perfil.nombre}`);
  partes.push(`Rol: ${enIdioma(perfil.rol, es)}`);
  partes.push(`Ubicación: ${perfil.ubicacion}`);
  partes.push(`Mensaje principal: ${enIdioma(perfil.mensaje, es)}`);
  partes.push(`Resumen: ${enIdioma(perfil.resumen, es)}`);
  partes.push(
    `Contacto público: email ${perfil.contacto.email ?? "(no publicado)"}, LinkedIn ${perfil.contacto.linkedin ?? "(no publicado)"}, GitHub ${perfil.contacto.github ?? "(no publicado)"}`,
  );

  partes.push(`\n## Qué busca\n${lista(enIdioma(perfil.busca, es))}`);
  partes.push(`\n## Desarrollo (perfil principal)\n${lista(enIdioma(perfil.desarrollo, es))}`);
  partes.push(`\n## Sistemas, redes y soporte (perfil complementario)\n${enIdioma(perfil.complementarioIntro, es)}\n${lista(enIdioma(perfil.complementario, es))}`);
  partes.push(`\n## Cómo trabaja\n${lista(enIdioma(perfil.competencias, es))}`);

  partes.push("\n## Experiencia profesional");
  for (const e of perfil.experiencia) {
    partes.push(`### ${enIdioma(e.puesto, es)} en ${e.empresa} (${enIdioma(e.fechas, es)})\n${lista(enIdioma(e.tareas, es))}`);
  }

  partes.push("\n## Formación");
  for (const f of perfil.formacion) {
    partes.push(`- ${enIdioma(f.titulo, es)}${f.centro ? `, ${f.centro}` : ""}${f.fechas ? ` (${f.fechas})` : ""}`);
  }
  partes.push(`\n## Certificaciones\n${lista(enIdioma(perfil.certificaciones, es))}`);
  partes.push(`\n## Idiomas\n${lista(enIdioma(perfil.idiomas, es))}`);

  partes.push("\n## Tecnologías");
  partes.push("Formato: nombre (grupo) · declarada por Mario o solo usada en proyectos · dónde la usa.");
  for (const t of obtenerTecnologias()) {
    const proyectos = proyectosQueUsan(t.id).map((p) => p.slug);
    const donde = proyectos.length ? `proyectos: ${proyectos.join(", ")}` : (enIdioma(t.contexto ?? {}, es) ?? "sin proyecto público");
    partes.push(`- ${nombreTecnologia(t, es)} (${t.grupo}) · ${t.destacada ? "declarada" : "usada en proyectos"} · ${donde}`);
  }

  partes.push("\n## Proyectos (el identificador entre corchetes es el slug)");
  for (const p of listarProyectos()) {
    const tx = p.textos.es!.datos;
    partes.push(`\n### [${p.slug}] ${tx.titulo} · ${p.datos.estado} · ${p.datos.anio}`);
    partes.push(`Resumen: ${tx.resumen}`);
    if (tx.contexto) partes.push(`Contexto: ${tx.contexto}`);
    if (tx.objetivo) partes.push(`Objetivo: ${tx.objetivo}`);
    if (tx.usuario) partes.push(`Usuario: ${tx.usuario}`);
    if (tx.estadoTexto) partes.push(`Estado: ${tx.estadoTexto}`);
    partes.push(`Tecnologías: ${p.datos.tecnologias.join(", ")}`);
    if (tx.funcionalidades) partes.push(`Funcionalidades:\n${lista(tx.funcionalidades)}`);
    if (tx.retos) partes.push(`Retos técnicos:\n${lista(tx.retos.map((r) => `${r.titulo}: ${r.texto}`))}`);
    if (tx.arquitectura) partes.push(`Arquitectura: ${tx.arquitectura.nodos.map((n) => `${n.titulo} (${n.detalle})`).join(" → ")}`);
    if (p.datos.repositorio) partes.push(`Código: ${p.datos.repositorio}`);
    if (p.datos.demo) partes.push(`Demo: ${p.datos.demo.url}`);
  }

  partes.push(datosDelCV());

  const articulos = listarArticulos().filter((a) => a.textos.es && !a.textos.es.datos.borrador);
  if (articulos.length) {
    partes.push("\n## Artículos del blog");
    for (const a of articulos) partes.push(`- ${a.textos.es!.datos.titulo}: ${a.textos.es!.datos.resumen}`);
  }

  cache = partes.join("\n");
  return cache;
}

type ExperienciaCV = {
  puesto: string;
  empresa: string;
  tipo?: string;
  fechas: string;
  lugar?: string;
  intro?: string;
  proyectos?: { nombre: string; nota?: string }[];
};
type CV = { experiencia: ExperienciaCV[]; habilidades: { grupo: string; items: string[] }[]; otros?: string[] };

/**
 * Datos del CV en PDF que publica la web (cv/datos.js) y que no están en el perfil:
 * qué experiencias fueron prácticas, los proyectos propios desde 2017 y las habilidades de sistemas.
 * No se incluyen los datos de contacto del CV (el teléfono no se publica en la web).
 */
function datosDelCV(): string {
  try {
    const fuente = readFileSync(path.join(process.cwd(), "cv", "datos.js"), "utf-8");
    const ventana: { CV?: { es: CV } } = {};
    new Function("window", fuente)(ventana);
    const cv = ventana.CV!.es;
    const lineas = ["\n## Datos del CV publicado (complementan la experiencia anterior)"];
    for (const e of cv.experiencia) {
      const tipo = e.tipo ? ` · ${e.tipo}` : "";
      const proyectos = e.proyectos?.length ? ` Proyectos: ${e.proyectos.map((p) => p.nombre + (p.nota ? ` (${p.nota})` : "")).join(", ")}.` : "";
      lineas.push(`- ${e.puesto} · ${e.empresa}${tipo} · ${e.fechas}${e.lugar ? ` · ${e.lugar}` : ""}.${e.intro ? ` ${e.intro}` : ""}${proyectos}`);
    }
    lineas.push("Nota: las experiencias marcadas como «Prácticas» fueron prácticas formativas, no contratos laborales.");
    for (const h of cv.habilidades) lineas.push(`- Habilidades de ${h.grupo}: ${h.items.join(", ")}`);
    if (cv.otros?.length) lineas.push(`- Otros: ${cv.otros.join(", ")}`);
    return lineas.join("\n");
  } catch (e) {
    console.error("No se han podido leer los datos del CV para la IA", e);
    return "";
  }
}

/** Slugs de proyectos que existen, para descartar cualquier otro que devuelva la IA. */
export function slugsValidos(): Set<string> {
  return new Set(listarProyectos().map((p) => p.slug));
}
