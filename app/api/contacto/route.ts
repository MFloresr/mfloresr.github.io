import { z } from "zod";
import { routing } from "@/i18n/routing";
import { obtenerPerfil } from "@/lib/contenido/leer";
import { ErrorContacto, contactoConfigurado, enviarMensaje } from "@/lib/contacto/enviar";
import { registrarEnvio } from "@/lib/contacto/limite";
import { mismoOrigen } from "@/lib/ia/peticion";

/**
 * Formulario de contacto: valida el mensaje y lo envía por correo con Resend.
 * No se guarda nada en esta web. Solo acepta peticiones de la propia web, tiene un campo trampa
 * contra bots y un límite de envíos por visitante.
 */

export const maxDuration = 30;

const entrada = z.object({
  nombre: z.string().trim().min(2).max(80),
  email: z.email().max(200),
  mensaje: z.string().trim().min(10).max(3000),
  acepto: z.literal(true),
  idioma: z.enum(routing.locales),
  web: z.string().max(0).optional(),
});

type Motivo = "no-configurada" | "fallo" | "origen" | "demasiadas" | "datos";
const ESTADOS: Record<Motivo, number> = { "no-configurada": 503, fallo: 502, origen: 403, demasiadas: 429, datos: 400 };

function error(motivo: Motivo) {
  return Response.json({ error: motivo }, { status: ESTADOS[motivo], headers: { "cache-control": "no-store" } });
}

export async function POST(req: Request) {
  if (!mismoOrigen(req)) return error("origen");

  const datos = entrada.safeParse(await req.json().catch(() => null));
  if (!datos.success) return error("datos");
  // Antes de gastar un envío: sin clave el formulario no está disponible
  if (!contactoConfigurado()) return error("no-configurada");
  if (!registrarEnvio(req)) return error("demasiadas");

  const destino = obtenerPerfil().contacto.email;
  if (!destino) return error("no-configurada");

  try {
    const { nombre, email, mensaje, idioma } = datos.data;
    await enviarMensaje(destino, { nombre, email, mensaje, idioma });
    return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    if (e instanceof ErrorContacto) return error(e.motivo);
    console.error("Fallo inesperado en el formulario de contacto");
    return error("fallo");
  }
}
