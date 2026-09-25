/**
 * Llamada a la API de Gemini (plan gratuito) con respuesta JSON según un esquema.
 * Si el modelo principal está saturado o sin cuota, prueba con los de reserva.
 * La clave va en GEMINI_API_KEY (variable de entorno de Vercel, nunca en el código).
 */

const URL_API = "https://generativelanguage.googleapis.com/v1beta/models";
const MODELOS = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash"];
/** Errores que merecen probar con otro modelo: cuota, saturación o fallo temporal. */
const REINTENTABLES = new Set([429, 500, 502, 503, 504]);

export type MotivoIA = "no-configurada" | "limite" | "saturada" | "fallo";

export class ErrorIA extends Error {
  constructor(public motivo: MotivoIA) {
    super(motivo);
  }
}

export type Turno = { rol: "user" | "model"; texto: string };

type Opciones = {
  sistema: string;
  turnos: Turno[];
  esquema: object;
  /** Máximo de tokens de la respuesta. */
  maxTokens?: number;
};

export function iaConfigurada(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Devuelve el JSON (sin validar) que genera Gemini. */
export async function pedirJson({ sistema, turnos, esquema, maxTokens = 2048 }: Opciones): Promise<unknown> {
  const clave = process.env.GEMINI_API_KEY;
  if (!clave) throw new ErrorIA("no-configurada");

  let ultimoCodigo: number | null = null;
  for (const modelo of MODELOS) {
    const generationConfig: Record<string, unknown> = {
      responseMimeType: "application/json",
      responseJsonSchema: esquema,
      temperature: 0.3,
      maxOutputTokens: maxTokens,
    };
    if (modelo.startsWith("gemini-3")) generationConfig.thinkingConfig = { thinkingLevel: "low" };

    let res: Response;
    try {
      res = await fetch(`${URL_API}/${modelo}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": clave },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sistema }] },
          contents: turnos.map((t) => ({ role: t.rol, parts: [{ text: t.texto }] })),
          generationConfig,
        }),
        signal: AbortSignal.timeout(25_000),
      });
    } catch (e) {
      console.warn(`Gemini ${modelo}: sin respuesta (${(e as Error).name}), probando otro modelo`);
      ultimoCodigo = null;
      continue;
    }

    if (!res.ok) {
      ultimoCodigo = res.status;
      if (REINTENTABLES.has(res.status)) {
        console.warn(`Gemini ${modelo} no disponible (${res.status}), probando otro modelo`);
        continue;
      }
      // 400/401/403/404: clave o configuración incorrectas; no tiene sentido reintentar
      console.error(`Error de configuración de Gemini en ${modelo}: ${res.status} ${(await res.text()).slice(0, 300)}`);
      throw new ErrorIA("fallo");
    }

    const datos = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
      promptFeedback?: { blockReason?: string };
    };
    const texto = (datos.candidates?.[0]?.content?.parts ?? [])
      .filter((p) => !p.thought)
      .map((p) => p.text ?? "")
      .join("");
    if (!texto) {
      console.error(`Gemini ${modelo} no devolvió texto`, datos.candidates?.[0]?.finishReason ?? datos.promptFeedback?.blockReason);
      throw new ErrorIA("fallo");
    }
    try {
      return JSON.parse(texto);
    } catch {
      console.error(`Gemini ${modelo} devolvió un JSON no válido`);
      throw new ErrorIA("fallo");
    }
  }

  throw new ErrorIA(ultimoCodigo === 429 ? "limite" : "saturada");
}
