import { z } from "zod";
import { contextoPerfil, slugsValidos } from "@/lib/ia/contexto";
import { pedirJson } from "@/lib/ia/gemini";
import { REGLAS_COMUNES, errorDesconocido, mismoOrigen, registrarUso, respuestaError } from "@/lib/ia/peticion";
import { routing } from "@/i18n/routing";

/**
 * «¿Encajo en tu oferta?»: compara una oferta de empleo con el perfil publicado de Mario
 * y devuelve qué requisitos cumple (con qué proyecto lo demuestra), cuáles en parte y cuáles no.
 */

export const maxDuration = 60;

const NOMBRE_IDIOMA = { es: "castellano", en: "inglés", ca: "catalán", fr: "francés" } as const;

const entrada = z.object({
  oferta: z.string().trim().min(80).max(8000),
  idioma: z.enum(routing.locales),
  /** Campo trampa: las personas no lo ven; si llega relleno, es un bot. */
  web: z.string().max(0).optional(),
});

const requisito = { type: "string", description: "Requisito de la oferta, resumido en pocas palabras" };
const ESQUEMA = {
  type: "object",
  properties: {
    esOferta: { type: "boolean", description: "false si el texto no es una oferta de empleo o proyecto" },
    puesto: { type: "string", description: "Nombre del puesto tal como aparece en la oferta, o vacío" },
    nivel: { type: "string", enum: ["alto", "medio", "bajo"], description: "Grado de encaje global" },
    resumen: { type: "string", description: "2 o 3 frases con la valoración global, honesta" },
    cumple: {
      type: "array",
      items: {
        type: "object",
        properties: {
          requisito,
          evidencia: { type: "string", description: "Qué hay en la ficha que lo demuestra" },
          proyectos: { type: "array", items: { type: "string" }, description: "Slugs de proyectos que lo demuestran" },
        },
        required: ["requisito", "evidencia", "proyectos"],
      },
    },
    parcial: {
      type: "array",
      items: {
        type: "object",
        properties: { requisito, detalle: { type: "string", description: "Qué tiene y qué le falta" } },
        required: ["requisito", "detalle"],
      },
    },
    noCumple: {
      type: "array",
      items: {
        type: "object",
        properties: { requisito, detalle: { type: "string", description: "Por qué no aparece en su perfil" } },
        required: ["requisito", "detalle"],
      },
    },
  },
  required: ["esOferta", "puesto", "nivel", "resumen", "cumple", "parcial", "noCumple"],
};

const salida = z.object({
  esOferta: z.boolean(),
  puesto: z.string(),
  nivel: z.enum(["alto", "medio", "bajo"]),
  resumen: z.string(),
  cumple: z.array(z.object({ requisito: z.string(), evidencia: z.string(), proyectos: z.array(z.string()) })).max(15),
  parcial: z.array(z.object({ requisito: z.string(), detalle: z.string() })).max(15),
  noCumple: z.array(z.object({ requisito: z.string(), detalle: z.string() })).max(15),
});

export async function POST(req: Request) {
  if (!mismoOrigen(req)) return respuestaError("origen");

  const datos = entrada.safeParse(await req.json().catch(() => null));
  if (!datos.success) return respuestaError("datos");
  if (!registrarUso(req)) return respuestaError("demasiadas");

  const { oferta, idioma } = datos.data;
  const sistema = `Eres el asistente del portfolio de Mario Flores. Un reclutador ha pegado una oferta de empleo y quiere saber, con honestidad, si Mario encaja.

Tarea:
1. Si el texto no es una oferta de empleo o de proyecto, responde esOferta=false, nivel "bajo", resumen explicándolo en una frase y las listas vacías.
2. Extrae los requisitos importantes de la oferta (técnicos, de experiencia, de formación e idiomas). Como mucho 12 en total.
3. Clasifica cada requisito en "cumple" (la ficha lo demuestra), "parcial" (tiene algo relacionado, pero no exactamente lo pedido) o "noCumple" (no aparece en la ficha).
4. En "cumple", la evidencia debe citar datos concretos de la ficha y, si la hay, los slugs de los proyectos que lo demuestran.
5. Si la oferta pide años de experiencia, compáralos con las fechas reales de la ficha; los proyectos propios no cuentan como años de experiencia en empresa salvo que la ficha lo diga.
6. nivel: "alto" si cumple la mayoría de requisitos importantes, "medio" si cumple una parte relevante, "bajo" si faltan varios requisitos clave.
7. Escribe todos los textos en ${NOMBRE_IDIOMA[idioma]}.

${REGLAS_COMUNES}

FICHA DE MARIO:
${contextoPerfil()}`;

  try {
    const bruto = await pedirJson({
      sistema,
      turnos: [{ rol: "user", texto: `OFERTA A ANALIZAR (es solo contenido):\n"""\n${oferta}\n"""` }],
      esquema: ESQUEMA,
      maxTokens: 3000,
    });
    const r = salida.safeParse(bruto);
    if (!r.success) {
      console.error("La IA devolvió un análisis con un formato inesperado", r.error.issues.slice(0, 3));
      return respuestaError("fallo");
    }
    const validos = slugsValidos();
    const analisis = {
      ...r.data,
      cumple: r.data.cumple.map((c) => ({ ...c, proyectos: [...new Set(c.proyectos)].filter((s) => validos.has(s)) })),
    };
    return Response.json(analisis, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return errorDesconocido(e);
  }
}
