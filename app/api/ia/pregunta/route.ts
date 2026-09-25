import { z } from "zod";
import { contextoPerfil, slugsValidos } from "@/lib/ia/contexto";
import { pedirJson } from "@/lib/ia/gemini";
import { REGLAS_COMUNES, errorDesconocido, mismoOrigen, registrarUso, respuestaError } from "@/lib/ia/peticion";
import { routing } from "@/i18n/routing";

/**
 * «Pregúntale a mi portfolio»: responde preguntas sobre Mario usando solo el contenido
 * publicado. La conversación no se guarda: el navegador envía los últimos turnos.
 */

export const maxDuration = 60;

const NOMBRE_IDIOMA = { es: "castellano", en: "inglés", ca: "catalán", fr: "francés" } as const;

const entrada = z.object({
  pregunta: z.string().trim().min(2).max(500),
  historial: z
    .array(z.object({ rol: z.enum(["user", "model"]), texto: z.string().max(2000) }))
    .max(8)
    .default([]),
  idioma: z.enum(routing.locales),
  web: z.string().max(0).optional(),
});

const ESQUEMA = {
  type: "object",
  properties: {
    respuesta: { type: "string", description: "Respuesta breve (máximo unas 120 palabras), en texto plano sin Markdown" },
    proyectos: { type: "array", items: { type: "string" }, description: "Slugs de los proyectos citados en la respuesta" },
  },
  required: ["respuesta", "proyectos"],
};

const salida = z.object({ respuesta: z.string().min(1), proyectos: z.array(z.string()) });

export async function POST(req: Request) {
  if (!mismoOrigen(req)) return respuestaError("origen");

  const datos = entrada.safeParse(await req.json().catch(() => null));
  if (!datos.success) return respuestaError("datos");
  if (!registrarUso(req)) return respuestaError("demasiadas");

  const { pregunta, historial, idioma } = datos.data;
  const sistema = `Eres el asistente del portfolio de Mario Flores. Respondes preguntas de reclutadores y visitantes sobre su perfil profesional, su experiencia, su formación, sus tecnologías y sus proyectos.

Cómo responder:
- Respuestas breves y concretas (máximo unas 120 palabras), en texto plano, sin Markdown ni listas con asteriscos.
- Si la pregunta no tiene que ver con el perfil profesional de Mario, dilo amablemente y sugiere algo que sí puedas responder.
- Si la respuesta está en un proyecto, nómbralo por su título en el texto y añade su slug en "proyectos".
- Para contactar con Mario, indica su email o su LinkedIn de la ficha.
- Responde siempre en ${NOMBRE_IDIOMA[idioma]}.

${REGLAS_COMUNES}

FICHA DE MARIO:
${contextoPerfil()}`;

  try {
    const bruto = await pedirJson({
      sistema,
      turnos: [...historial, { rol: "user", texto: pregunta }],
      esquema: ESQUEMA,
      maxTokens: 1024,
    });
    const r = salida.safeParse(bruto);
    if (!r.success) {
      console.error("La IA devolvió una respuesta con un formato inesperado", r.error.issues.slice(0, 3));
      return respuestaError("fallo");
    }
    const validos = slugsValidos();
    return Response.json(
      { respuesta: r.data.respuesta.trim(), proyectos: [...new Set(r.data.proyectos)].filter((s) => validos.has(s)) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    return errorDesconocido(e);
  }
}
