"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AvisoError, CampoTrampa, Cargando, EnlacesProyectos, llamarIA, type MotivoError } from "./comun";

type Analisis = {
  esOferta: boolean;
  puesto: string;
  nivel: "alto" | "medio" | "bajo";
  resumen: string;
  cumple: { requisito: string; evidencia: string; proyectos: string[] }[];
  parcial: { requisito: string; detalle: string }[];
  noCumple: { requisito: string; detalle: string }[];
};

const MIN = 80;
const MAX = 8000;

const ESTILO_NIVEL = {
  alto: "bg-exito-suave text-exito",
  medio: "bg-pendiente-fondo text-pendiente-texto",
  bajo: "bg-falta-suave text-falta",
};

/** «¿Encajo en tu oferta?»: el reclutador pega una oferta y ve el encaje con el perfil. */
export default function Encaje({ titulos, email }: { titulos: Record<string, string>; email: string | null }) {
  const t = useTranslations("ai.fit");
  const idioma = useLocale();
  const id = useId();
  const [oferta, setOferta] = useState("");
  const [trampa, setTrampa] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<MotivoError | null>(null);
  const [analisis, setAnalisis] = useState<Analisis | null>(null);
  const resultado = useRef<HTMLDivElement>(null);

  const longitud = oferta.trim().length;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (longitud < MIN || cargando) return;
    setCargando(true);
    setError(null);
    setAnalisis(null);
    const r = await llamarIA<Analisis>("/api/ia/encaje", { oferta, idioma, web: trampa });
    setCargando(false);
    if ("error" in r) setError(r.error);
    else {
      setAnalisis(r.datos);
      requestAnimationFrame(() => resultado.current?.focus());
    }
  }

  const asunto = encodeURIComponent(analisis?.puesto ? t("mailSubjectRole", { puesto: analisis.puesto }) : t("mailSubject"));

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={enviar} className="relative flex flex-col gap-3">
        <CampoTrampa valor={trampa} alCambiar={setTrampa} />
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor={`${id}-oferta`} className="text-[15px] font-medium">
            {t("label")}
          </label>
          <button type="button" onClick={() => setOferta(t("example"))} className="text-sm font-medium text-acento hover:underline">
            {t("tryExample")}
          </button>
        </div>
        <textarea
          id={`${id}-oferta`}
          value={oferta}
          onChange={(e) => setOferta(e.target.value.slice(0, MAX))}
          rows={9}
          placeholder={t("placeholder")}
          aria-describedby={`${id}-ayuda`}
          className="w-full resize-y rounded-xl border border-linea bg-superficie px-4 py-3 text-[15px] leading-relaxed placeholder:text-tenue focus:border-acento focus:outline-none"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p id={`${id}-ayuda`} className="font-mono text-xs text-tenue">
            {longitud < MIN ? t("minLength", { n: MIN - longitud }) : t("length", { n: longitud, max: MAX })}
          </p>
          <button
            type="submit"
            disabled={longitud < MIN || cargando}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-acento bg-acento px-5 text-[15px] font-medium text-sobre-acento transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cargando ? <Cargando texto={t("loading")} /> : t("submit")}
          </button>
        </div>
      </form>

      <div aria-live="polite" className="flex flex-col gap-4">
        {error && <AvisoError motivo={error} />}

        {analisis && !analisis.esOferta && (
          <p className="rounded-xl border border-linea bg-superficie px-4 py-3 text-[15px]">{analisis.resumen || t("notAnOffer")}</p>
        )}

        {analisis?.esOferta && (
          <div ref={resultado} tabIndex={-1} className="flex flex-col gap-6 rounded-2xl border border-linea bg-superficie p-5 focus:outline-none sm:p-7">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${ESTILO_NIVEL[analisis.nivel]}`}>
                  {t(`level.${analisis.nivel}`)}
                </span>
                {analisis.puesto && <span className="font-mono text-[13px] text-tenue">{analisis.puesto}</span>}
              </div>
              <p className="text-[17px] leading-relaxed">{analisis.resumen}</p>
            </div>

            {analisis.cumple.length > 0 && (
              <Bloque titulo={t("meets")} n={analisis.cumple.length} tipo="cumple">
                {analisis.cumple.map((c) => (
                  <li key={c.requisito} className="flex gap-3">
                    <Marca tipo="cumple" />
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <span className="font-medium">{c.requisito}</span>
                      <span className="text-[15px] leading-relaxed text-tenue">{c.evidencia}</span>
                      <EnlacesProyectos slugs={c.proyectos} titulos={titulos} />
                    </div>
                  </li>
                ))}
              </Bloque>
            )}

            {analisis.parcial.length > 0 && (
              <Bloque titulo={t("partial")} n={analisis.parcial.length} tipo="parcial">
                {analisis.parcial.map((c) => (
                  <li key={c.requisito} className="flex gap-3">
                    <Marca tipo="parcial" />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium">{c.requisito}</span>
                      <span className="text-[15px] leading-relaxed text-tenue">{c.detalle}</span>
                    </div>
                  </li>
                ))}
              </Bloque>
            )}

            {analisis.noCumple.length > 0 && (
              <Bloque titulo={t("missing")} n={analisis.noCumple.length} tipo="falta">
                {analisis.noCumple.map((c) => (
                  <li key={c.requisito} className="flex gap-3">
                    <Marca tipo="falta" />
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium">{c.requisito}</span>
                      <span className="text-[15px] leading-relaxed text-tenue">{c.detalle}</span>
                    </div>
                  </li>
                ))}
              </Bloque>
            )}

            <div className="flex flex-col gap-3 border-t border-linea pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-tenue">{t("disclaimer")}</p>
              {email && (
                <a
                  href={`mailto:${email}?subject=${asunto}`}
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-[10px] border border-linea px-4 text-[15px] font-medium hover:border-texto"
                >
                  {t("contact")}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Bloque({ titulo, n, tipo, children }: { titulo: string; n: number; tipo: "cumple" | "parcial" | "falta"; children: React.ReactNode }) {
  const color = { cumple: "text-exito", parcial: "text-pendiente-texto", falta: "text-falta" }[tipo];
  return (
    <section className="flex flex-col gap-3">
      <h3 className={`font-mono text-[13px] ${color}`}>
        {titulo} · {n}
      </h3>
      <ul className="flex flex-col gap-4">{children}</ul>
    </section>
  );
}

function Marca({ tipo }: { tipo: "cumple" | "parcial" | "falta" }) {
  const estilo = { cumple: "bg-exito-suave text-exito", parcial: "bg-pendiente-fondo text-pendiente-texto", falta: "bg-falta-suave text-falta" }[tipo];
  const trazo = { cumple: "M5 12.5l4.5 4.5L19 7.5", parcial: "M6 12h12", falta: "M7 7l10 10M17 7L7 17" }[tipo];
  return (
    <span aria-hidden="true" className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${estilo}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={trazo} />
      </svg>
    </span>
  );
}
