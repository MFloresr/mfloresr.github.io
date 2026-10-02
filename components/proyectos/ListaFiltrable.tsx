"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ProyectoInicio, TecnologiaInicio } from "@/components/inicio/Explorar";
import { Flecha } from "@/components/ui/Iconos";
import { Link } from "@/i18n/navigation";

type Textos = {
  search: string;
  status: string;
  technology: string;
  all: string;
  allTech: string;
  count: string;
  clear: string;
  noResults: string;
  code: string;
  demo: string;
  view: string;
  pending: string;
  translationPending: string;
  draft: string;
};
export type ProyectoFiltrable = ProyectoInicio & { borrador: boolean };

const normalizar = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const plantilla = (texto: string, valores: Record<string, string | number>) => texto.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));

/**
 * Lista de proyectos con búsqueda y filtros por estado y tecnología. Los filtros se guardan en la URL
 * (?q=…&estado=…&tec=…), así que se pueden compartir.
 */
export default function ListaFiltrable({
  proyectos,
  tecnologias,
  estados,
  textos,
}: {
  proyectos: ProyectoFiltrable[];
  tecnologias: TecnologiaInicio[];
  estados: { clave: string; nombre: string }[];
  textos: Textos;
}) {
  const id = useId();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [tec, setTec] = useState("");
  const leida = useRef(false);
  const omitir = useRef(false);
  const nombres = useMemo(() => new Map(tecnologias.map((t) => [t.id, t.nombre])), [tecnologias]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // Se lee la URL al montar (no existe en el servidor), así que no puede ser el estado inicial
    /* eslint-disable react-hooks/set-state-in-effect */
    setQ(params.get("q") ?? "");
    setEstado(estados.some((e) => e.clave === params.get("estado")) ? params.get("estado")! : "");
    setTec(tecnologias.some((t) => t.id === params.get("tec")) ? params.get("tec")! : "");
    /* eslint-enable react-hooks/set-state-in-effect */
    leida.current = true;
    omitir.current = true;
  }, [estados, tecnologias]);

  useEffect(() => {
    if (!leida.current) return;
    // La primera pasada va con el estado anterior a leer la URL: no se escribe
    if (omitir.current) {
      omitir.current = false;
      return;
    }
    const url = new URL(window.location.href);
    for (const [clave, valor] of [["q", q], ["estado", estado], ["tec", tec]] as const) {
      if (valor) url.searchParams.set(clave, valor);
      else url.searchParams.delete(clave);
    }
    window.history.replaceState(null, "", url);
  }, [q, estado, tec]);

  const visibles = proyectos.filter((p) => {
    if (estado && p.estadoClave !== estado) return false;
    if (tec && !p.tecnologias.includes(tec)) return false;
    if (q.trim()) {
      const texto = normalizar(`${p.titulo} ${p.resumen ?? ""} ${p.contexto ?? ""} ${p.tecnologias.map((t) => nombres.get(t)).join(" ")}`);
      if (!normalizar(q).split(/\s+/).filter(Boolean).every((palabra) => texto.includes(palabra))) return false;
    }
    return true;
  });
  const hayFiltros = Boolean(q || estado || tec);
  const campo = "min-h-11 w-full rounded-[10px] border border-borde-control bg-superficie px-3 text-[15px] focus:border-cable focus:outline-none";

  return (
    <div className="flex flex-col gap-2">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-q`} className="text-[13px] font-semibold text-tenue">
            {textos.search}
          </label>
          <input id={`${id}-q`} name="q" type="search" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} className={campo} />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-estado`} className="text-[13px] font-semibold text-tenue">
            {textos.status}
          </label>
          <select id={`${id}-estado`} name="estado" value={estado} onChange={(e) => setEstado(e.target.value)} className={campo}>
            <option value="">{textos.all}</option>
            {estados.map((e) => (
              <option key={e.clave} value={e.clave}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-tec`} className="text-[13px] font-semibold text-tenue">
            {textos.technology}
          </label>
          <select id={`${id}-tec`} name="tec" value={tec} onChange={(e) => setTec(e.target.value)} className={campo}>
            <option value="">{textos.allTech}</option>
            {tecnologias.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div aria-live="polite" className="flex min-h-11 flex-wrap items-center gap-3 text-[15px] text-tenue">
        <span>{plantilla(textos.count, { n: visibles.length, total: proyectos.length })}</span>
        {hayFiltros && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setEstado("");
              setTec("");
            }}
            className="min-h-11 cursor-pointer rounded-full bg-cable-relleno px-4 font-semibold text-sobre-cable"
          >
            {textos.clear}
          </button>
        )}
      </div>

      {visibles.length === 0 && <p className="border-t border-linea py-10 text-[17px] text-tenue">{textos.noResults}</p>}

      <ol>
        {visibles.map((p, i) => {
          const href = `/projects/${p.slug}`;
          return (
            <li key={p.slug} className="grid gap-6 border-t border-linea py-10 md:grid-cols-[5fr_6fr] md:items-center md:gap-12">
              {p.captura ? (
                <div className="relative h-56 overflow-hidden rounded-xl border border-linea bg-chip md:h-72">
                  <Image src={p.captura.src} alt={p.captura.alt} fill sizes="(min-width: 768px) 45vw, 100vw" priority={i === 0} className="object-cover object-top" />
                </div>
              ) : (
                <div className="h-56 rounded-xl border border-dashed border-linea bg-chip md:h-72" />
              )}
              <article className="flex flex-col gap-3.5">
                <span className="text-[13px] text-tenue">
                  {p.estado} · {p.anio}
                </span>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-[34px]">
                  <Link href={href} className="hover:text-acento">
                    {p.titulo}
                  </Link>
                </h2>
                {p.resumen ? (
                  <p className="text-[17px] leading-relaxed text-tenue">{p.resumen}</p>
                ) : (
                  <Aviso etiqueta={textos.pending}>{textos.translationPending}</Aviso>
                )}
                {p.contexto && <p className="text-[13px] leading-relaxed text-tenue">{p.contexto}</p>}
                {p.borrador && <Aviso etiqueta={textos.pending}>{textos.draft}</Aviso>}
                <ul className="flex flex-wrap gap-1.5">
                  {p.tecnologias.map((t) => (
                    <li key={t}>
                      <button
                        type="button"
                        aria-pressed={tec === t}
                        onClick={() => setTec(tec === t ? "" : t)}
                        className="min-h-11 cursor-pointer rounded-full border border-borde-control px-3 text-[13px] transition-colors hover:border-cable hover:bg-cable/10 aria-pressed:border-cable-relleno aria-pressed:bg-cable-relleno aria-pressed:font-semibold aria-pressed:text-sobre-cable md:min-h-8"
                      >
                        {nombres.get(t)}
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap items-center gap-x-6">
                  <Link href={href} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-acento">
                    {textos.view}
                    <Flecha />
                  </Link>
                  {p.repositorio && (
                    <a href={p.repositorio} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-[15px] hover:text-acento">
                      {textos.code}
                    </a>
                  )}
                  {p.demo && (
                    <a href={p.demo} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-[15px] hover:text-acento">
                      {textos.demo}
                    </a>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Aviso({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-pendiente-borde bg-pendiente-fondo px-2.5 py-1 text-[13px] text-pendiente-texto" data-pendiente>
      <strong className="font-semibold">{etiqueta}:</strong> {children}
    </span>
  );
}
