"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { CampoTrampa, Cargando } from "@/components/ia/comun";
import { Link } from "@/i18n/navigation";

type MotivoServidor = "no-configurada" | "fallo" | "origen" | "demasiadas" | "datos" | "red";
type Campo = "nombre" | "email" | "mensaje" | "acepto";
type Errores = Partial<Record<Campo, string>>;

const MAX_MENSAJE = 3000;
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Formulario de contacto: envía el mensaje al correo de Mario (ruta /api/contacto, que usa Resend).
 * Valida en el navegador antes de enviar y también en el servidor.
 */
export default function FormularioContacto({ email }: { email: string }) {
  const t = useTranslations("contactForm");
  const idioma = useLocale();
  const id = useId();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [acepto, setAcepto] = useState(false);
  const [trampa, setTrampa] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState<MotivoServidor | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  const refNombre = useRef<HTMLInputElement>(null);
  const refEmail = useRef<HTMLInputElement>(null);
  const refMensaje = useRef<HTMLTextAreaElement>(null);
  const refAcepto = useRef<HTMLInputElement>(null);

  function validar(): Errores {
    const e: Errores = {};
    if (nombre.trim().length < 2) e.nombre = t("errors.name");
    if (!EMAIL_VALIDO.test(correo.trim())) e.email = t("errors.email");
    if (mensaje.trim().length < 10) e.mensaje = t("errors.message");
    if (!acepto) e.acepto = t("errors.consent");
    return e;
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (enviando) return;
    setFallo(null);
    const e = validar();
    setErrores(e);
    const primero = (["nombre", "email", "mensaje", "acepto"] as const).find((c) => e[c]);
    if (primero) {
      const destino = { nombre: refNombre, email: refEmail, mensaje: refMensaje, acepto: refAcepto }[primero];
      destino.current?.focus();
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ nombre: nombre.trim(), email: correo.trim(), mensaje: mensaje.trim(), acepto: true, idioma, web: trampa }),
      });
      if (res.ok) {
        setEnviado(correo.trim());
        setNombre("");
        setCorreo("");
        setMensaje("");
        setAcepto(false);
      } else {
        const json = (await res.json().catch(() => ({}))) as { error?: MotivoServidor };
        setFallo(json.error ?? "fallo");
      }
    } catch {
      setFallo("red");
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-2xl border border-exito bg-exito-suave p-5 sm:p-6">
        <h2 className="text-xl font-bold">{t("sentTitle")}</h2>
        <p className="leading-relaxed">{t("sentText", { email: enviado })}</p>
        <button
          type="button"
          onClick={() => setEnviado(null)}
          className="min-h-11 w-fit cursor-pointer rounded-[10px] border border-borde-control px-4 text-[15px] font-medium hover:border-texto"
        >
          {t("another")}
        </button>
      </div>
    );
  }

  const campo = (c: Campo) =>
    `min-h-12 w-full rounded-[10px] border bg-superficie px-4 text-[16px] focus:border-cable focus:outline-none ${errores[c] ? "border-falta" : "border-borde-control"}`;
  const error = (c: Campo) =>
    errores[c] ? (
      <p id={`${id}-${c}-error`} className="text-[14px] text-falta">
        {errores[c]}
      </p>
    ) : null;
  const ayuda = (c: Campo) => (errores[c] ? { "aria-invalid": true, "aria-describedby": `${id}-${c}-error` } : {});

  return (
    <form id="formulario" onSubmit={enviar} noValidate className="relative flex flex-col gap-4 rounded-2xl border border-linea bg-superficie p-5 sm:p-6">
      <CampoTrampa valor={trampa} alCambiar={setTrampa} />
      <h2 className="text-xl font-bold">{t("title")}</h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-nombre`} className="text-[14px] font-semibold">
          {t("name")}
        </label>
        <input
          ref={refNombre}
          id={`${id}-nombre`}
          name="nombre"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={campo("nombre")}
          {...ayuda("nombre")}
        />
        {error("nombre")}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-email`} className="text-[14px] font-semibold">
          {t("email")}
        </label>
        <input
          ref={refEmail}
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          maxLength={200}
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className={campo("email")}
          {...ayuda("email")}
        />
        {error("email")}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-mensaje`} className="text-[14px] font-semibold">
          {t("message")}
        </label>
        <textarea
          ref={refMensaje}
          id={`${id}-mensaje`}
          name="mensaje"
          rows={6}
          maxLength={MAX_MENSAJE}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder={t("messagePlaceholder")}
          className={`${campo("mensaje")} resize-y py-3`}
          {...ayuda("mensaje")}
        />
        <div className="flex flex-wrap justify-between gap-2">
          <span>{error("mensaje")}</span>
          <span className="text-[13px] text-tenue">{t("count", { n: mensaje.length, max: MAX_MENSAJE })}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[15px] leading-snug">
          <input
            ref={refAcepto}
            type="checkbox"
            name="acepto"
            checked={acepto}
            onChange={(e) => setAcepto(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-[var(--cable-relleno)]"
            {...ayuda("acepto")}
          />
          <span>
            {t.rich("consent", {
              enlace: (texto) => (
                <Link href="/privacy" target="_blank" className="underline underline-offset-4 hover:text-acento">
                  {texto}
                </Link>
              ),
            })}
          </span>
        </label>
        {error("acepto")}
      </div>

      <div aria-live="polite">
        {fallo && (
          <p role="alert" className="rounded-xl border border-pendiente-borde bg-pendiente-fondo px-4 py-3 text-[15px] text-pendiente-texto">
            {t(`errors.server.${fallo}`, { email })}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-[10px] border border-acento bg-acento px-5 text-[15px] font-medium text-sobre-acento transition hover:opacity-90 sm:w-fit"
      >
        {enviando ? <Cargando texto={t("sending")} /> : t("send")}
      </button>
    </form>
  );
}
