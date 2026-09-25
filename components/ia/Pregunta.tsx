"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AvisoError, CampoTrampa, Cargando, EnlacesProyectos, llamarIA, type MotivoError } from "./comun";

type Mensaje = { rol: "user" | "model"; texto: string; proyectos?: string[] };

/** Turnos que se envían como contexto (la conversación no se guarda en el servidor). */
const HISTORIAL = 8;

/** «Pregúntale a mi portfolio»: chat breve que responde solo con el contenido publicado. */
export default function Pregunta({ titulos }: { titulos: Record<string, string> }) {
  const t = useTranslations("ai.ask");
  const idioma = useLocale();
  const id = useId();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [trampa, setTrampa] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<MotivoError | null>(null);
  const lista = useRef<HTMLOListElement>(null);
  const sugerencias = [t("suggestion1"), t("suggestion2"), t("suggestion3")];

  useEffect(() => {
    lista.current?.lastElementChild?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [mensajes, cargando]);

  async function preguntar(pregunta: string) {
    const limpia = pregunta.trim();
    if (limpia.length < 2 || cargando) return;
    const historial = mensajes.slice(-HISTORIAL).map(({ rol, texto }) => ({ rol, texto }));
    setMensajes((m) => [...m, { rol: "user", texto: limpia }]);
    setTexto("");
    setError(null);
    setCargando(true);
    const r = await llamarIA<{ respuesta: string; proyectos: string[] }>("/api/ia/pregunta", { pregunta: limpia, historial, idioma, web: trampa });
    setCargando(false);
    if ("error" in r) {
      setError(r.error);
      // La pregunta no respondida vuelve al campo para poder reintentarla
      setMensajes((m) => m.slice(0, -1));
      setTexto(limpia);
    } else {
      setMensajes((m) => [...m, { rol: "model", texto: r.datos.respuesta, proyectos: r.datos.proyectos }]);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-linea bg-superficie p-4 sm:p-6">
      {mensajes.length === 0 ? (
        <div className="flex flex-col gap-3">
          <p className="text-[15px] text-tenue">{t("empty")}</p>
          <ul className="flex flex-wrap gap-2">
            {sugerencias.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => preguntar(s)}
                  disabled={cargando}
                  className="rounded-full border border-linea px-3.5 py-2 text-left text-sm hover:border-acento hover:text-acento disabled:opacity-50"
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ol ref={lista} aria-label={t("conversation")} className="flex max-h-[28rem] flex-col gap-4 overflow-y-auto pr-1">
          {mensajes.map((m, i) =>
            m.rol === "user" ? (
              <li key={i} className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md bg-acento px-4 py-2.5 text-[15px] leading-relaxed text-sobre-acento">
                  <span className="sr-only">{t("you")}: </span>
                  {m.texto}
                </p>
              </li>
            ) : (
              <li key={i} className="flex max-w-[92%] flex-col gap-2">
                <p className="rounded-2xl rounded-bl-md bg-chip px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-line">
                  <span className="sr-only">{t("assistant")}: </span>
                  {m.texto}
                </p>
                <EnlacesProyectos slugs={m.proyectos ?? []} titulos={titulos} />
              </li>
            ),
          )}
          {cargando && (
            <li className="text-sm text-tenue">
              <Cargando texto={t("loading")} />
            </li>
          )}
        </ol>
      )}

      <div aria-live="polite">{error && <AvisoError motivo={error} />}</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          preguntar(texto);
        }}
        className="relative flex flex-col gap-2 sm:flex-row"
      >
        <CampoTrampa valor={trampa} alCambiar={setTrampa} />
        <label htmlFor={`${id}-pregunta`} className="sr-only">
          {t("label")}
        </label>
        <input
          id={`${id}-pregunta`}
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value.slice(0, 500))}
          placeholder={t("placeholder")}
          autoComplete="off"
          className="h-12 w-full min-w-0 shrink-0 rounded-[10px] border border-linea bg-fondo sm:w-auto sm:flex-1 px-4 text-[15px] placeholder:text-tenue focus:border-acento focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={texto.trim().length < 2 || cargando}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-[10px] border border-acento bg-acento px-5 text-[15px] font-medium text-sobre-acento transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {t("submit")}
          </button>
          {mensajes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMensajes([]);
                setError(null);
              }}
              disabled={cargando}
              className="inline-flex h-12 items-center justify-center rounded-[10px] border border-linea px-4 text-[15px] font-medium hover:border-texto disabled:opacity-50"
            >
              {t("clear")}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
