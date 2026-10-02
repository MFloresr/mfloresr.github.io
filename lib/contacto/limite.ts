/**
 * Límite de envíos del formulario de contacto, para frenar el spam.
 * Vive en la memoria de cada instancia de la función (no es exacto si Vercel abre varias),
 * pero basta para frenar abusos. No se guarda de forma permanente.
 */

const VENTANA_CORTA = 10 * 60 * 1000;
const MAX_CORTA = 3; // envíos por visitante cada 10 minutos
const VENTANA_DIA = 24 * 60 * 60 * 1000;
const MAX_DIA = 8; // envíos por visitante al día
const MAX_GLOBAL_DIA = 60; // envíos por instancia al día

const usos = new Map<string, number[]>();
let global: number[] = [];

function ipDe(req: Request): string {
  return req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "desconocida";
}

/** Apunta un envío y devuelve false si el visitante (o la instancia) ha superado el límite. */
export function registrarEnvio(req: Request, ahora = Date.now()): boolean {
  global = global.filter((t) => ahora - t < VENTANA_DIA);
  if (global.length >= MAX_GLOBAL_DIA) return false;

  const ip = ipDe(req);
  const propios = (usos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_DIA);
  const recientes = propios.filter((t) => ahora - t < VENTANA_CORTA);
  if (recientes.length >= MAX_CORTA || propios.length >= MAX_DIA) {
    usos.set(ip, propios);
    return false;
  }
  propios.push(ahora);
  usos.set(ip, propios);
  global.push(ahora);

  // Limpieza ocasional para que el mapa no crezca sin fin
  if (usos.size > 5000) {
    for (const [clave, lista] of usos) if (!lista.some((t) => ahora - t < VENTANA_DIA)) usos.delete(clave);
  }
  return true;
}
