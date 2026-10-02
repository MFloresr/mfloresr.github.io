import { getTranslations } from "next-intl/server";
import type { DatosInicio } from "@/components/inicio/Explorar";
import type { Idioma } from "@/i18n/routing";
import type { IdiomaContenido } from "@/lib/contenido/esquemas";
import { capturasEnIdioma, enIdioma, nombreTecnologia } from "@/lib/contenido/idioma";
import { listarProyectos, obtenerPerfil, obtenerTecnologias } from "@/lib/contenido/leer";
import { CV_PDF } from "@/lib/sitio";

/**
 * Datos de la parte interactiva (panel de conexiones, lista de proyectos y consola) con los
 * textos del idioma actual. Los usan el inicio y la página de tecnologías.
 */
export async function construirDatosInicio(idioma: IdiomaContenido): Promise<DatosInicio> {
  const t = await getTranslations("home");
  const tproy = await getTranslations("projects");
  const perfil = obtenerPerfil();
  const proyectos = listarProyectos();
  const tecnologias = obtenerTecnologias();
  const usadas = new Set(proyectos.flatMap((p) => p.datos.tecnologias));
  const claves = ["panelTitle", "panelHint", "panelRegion", "panelUses", "panelTech", "panelOpen", "panelOpenAll", "listIdle", "listFilter", "listClear", "conTitle", "conOut", "conPlaceholder", "conGreeting", "conHelp", "conUnknown", "conNeedTech", "conNoTech", "conUseOk", "conNoProjects", "conCv"];
  return {
    proyectos: proyectos.map((p) => {
      const texto = p.textos[idioma]?.datos;
      const captura = capturasEnIdioma(p.datos, idioma)[0];
      return {
        slug: p.slug,
        titulo: texto?.titulo ?? p.textos.es!.datos.titulo,
        estado: tproy(`status.${p.datos.estado}`),
        estadoClave: p.datos.estado,
        anio: p.datos.anio,
        resumen: texto?.resumen ?? null,
        contexto: texto?.contexto ?? null,
        tecnologias: p.datos.tecnologias,
        demo: p.datos.demo?.url ?? null,
        repositorio: p.datos.repositorio ?? null,
        captura: captura ? { src: `/proyectos/${p.slug}/${captura.archivo}`, alt: captura.alt } : null,
      };
    }),
    tecnologias: tecnologias.filter((tec) => usadas.has(tec.id)).map((tec) => ({ id: tec.id, nombre: nombreTecnologia(tec, idioma) })),
    textos: Object.fromEntries(claves.map((k) => [k, (t.raw as (clave: string) => string)(k)])),
    ordenes: { help: t.raw("cmd.help"), projects: t.raw("cmd.projects"), stack: t.raw("cmd.stack"), use: t.raw("cmd.use"), path: t.raw("cmd.path"), contact: t.raw("cmd.contact"), cv: t.raw("cmd.cv"), clear: t.raw("cmd.clear") } as DatosInicio["ordenes"],
    etiquetas: { verFicha: tproy("viewProject"), codigo: tproy("code"), demo: tproy("demo") },
    recorrido: [
      ...perfil.formacion.map((f) => `${f.fechas ?? ""} ${enIdioma(f.titulo, idioma) ?? ""}${f.centro ? `, ${f.centro}` : ""}`.trim()),
      ...perfil.experiencia.map((x) => `${enIdioma(x.fechas, idioma) ?? ""} ${enIdioma(x.puesto, idioma) ?? ""}, ${x.empresa}`.trim()),
    ],
    contacto: perfil.contacto,
    cv: CV_PDF[idioma as Idioma],
  };
}
