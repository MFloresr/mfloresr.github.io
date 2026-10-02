/**
 * Envío del formulario de contacto con Resend (https://resend.com), por su API HTTP.
 *
 * Variables de entorno (en Vercel; nunca en el código):
 * - RESEND_API_KEY  clave de la API. Sin ella el formulario muestra «no disponible».
 * - CONTACT_TO      correo que recibe los mensajes (por defecto, el del perfil).
 * - CONTACT_FROM    remitente (por defecto, el de pruebas de Resend). Con un dominio verificado
 *                   en Resend puede ser, por ejemplo, "Portfolio <web@tudominio.com>".
 * - RESEND_API_URL  solo para pruebas locales con un servidor simulado.
 *
 * Con el remitente de pruebas (onboarding@resend.dev) Resend solo entrega al correo con el que
 * se creó la cuenta, que es justo lo que hace falta aquí.
 */

const URL_RESEND = process.env.RESEND_API_URL ?? "https://api.resend.com/emails";
const REMITENTE_PRUEBAS = "Portfolio <onboarding@resend.dev>";

export type MotivoContacto = "no-configurada" | "fallo";

export class ErrorContacto extends Error {
  constructor(public motivo: MotivoContacto) {
    super(motivo);
  }
}

export type Mensaje = { nombre: string; email: string; mensaje: string; idioma: string };

export function contactoConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Sin saltos de línea: lo que se pone en cabeceras (asunto) no puede llevarlos. */
const enUnaLinea = (texto: string) => texto.replace(/[\r\n]+/g, " ").trim();

export async function enviarMensaje(destino: string, { nombre, email, mensaje, idioma }: Mensaje): Promise<void> {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) throw new ErrorContacto("no-configurada");

  let res: Response;
  try {
    res = await fetch(URL_RESEND, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${clave}` },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || REMITENTE_PRUEBAS,
        to: [process.env.CONTACT_TO || destino],
        reply_to: email,
        subject: `Mensaje desde el portfolio: ${enUnaLinea(nombre).slice(0, 80)}`,
        text: `Nombre: ${enUnaLinea(nombre)}\nEmail: ${email}\nIdioma de la web: ${idioma}\n\n${mensaje}\n`,
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ErrorContacto("fallo");
  }
  if (!res.ok) {
    // Solo el estado: el cuerpo de la respuesta podría repetir datos del mensaje
    console.error("Resend rechazó el envío del formulario de contacto", res.status);
    throw new ErrorContacto("fallo");
  }
}
