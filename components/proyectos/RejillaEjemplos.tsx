"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Flecha } from "@/components/ui/Iconos";

export type EjemploVista = {
  id: string;
  nombre: string;
  sector: string;
  sectorNombre: string;
  tagline: string;
  detalle: string;
  url: string;
  repositorio: string;
};
type Textos = {
  sector: string;
  all: string;
  count: string;
  clear: string;
  noResults: string;
  visit: string;
  code: string;
  prev: string;
  next: string;
  pagination: string;
  goPage: string;
};

const POR_PAGINA = 6;
const plantilla = (texto: string, valores: Record<string, string | number>) => texto.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));

/**
 * Rejilla compacta de webs de ejemplo con filtro por sector y paginación (6 por página).
 * El filtro y la página se guardan en la URL (?sector=…&pagina=…), así que se pueden compartir.
 */
export default function RejillaEjemplos({ ejemplos, sectores, textos }: { ejemplos: EjemploVista[]; sectores: { clave: string; nombre: string }[]; textos: Textos }) {
  const [sector, setSector] = useState("");
  const [pagina, setPagina] = useState(1);
  const leida = useRef(false);
  const omitir = useRef(false);
  const arriba = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // La URL no existe en el servidor: se lee al montar
    const params = new URLSearchParams(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect */
    setSector(sectores.some((s) => s.clave === params.get("sector")) ? params.get("sector")! : "");
    setPagina(Math.max(1, Number.parseInt(params.get("pagina") ?? "1", 10) || 1));
    /* eslint-enable react-hooks/set-state-in-effect */
    leida.current = true;
    omitir.current = true;
  }, [sectores]);

  useEffect(() => {
    if (!leida.current) return;
    if (omitir.current) {
      omitir.current = false;
      return;
    }
    const url = new URL(window.location.href);
    if (sector) url.searchParams.set("sector", sector);
    else url.searchParams.delete("sector");
    if (pagina > 1) url.searchParams.set("pagina", String(pagina));
    else url.searchParams.delete("pagina");
    window.history.replaceState(null, "", url);
  }, [sector, pagina]);

  const filtrados = ejemplos.filter((e) => !sector || e.sector === sector);
  const total = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const actual = Math.min(pagina, total);
  const visibles = filtrados.slice((actual - 1) * POR_PAGINA, actual * POR_PAGINA);

  const elegir = (clave: string) => {
    setSector(clave);
    setPagina(1);
  };
  const ir = (n: number) => {
    setPagina(n);
    arriba.current?.scrollIntoView({ block: "start" });
  };
  const chip =
    "min-h-11 cursor-pointer rounded-full border border-borde-control px-3.5 text-[14px] transition-colors hover:border-cable hover:bg-cable/10 aria-pressed:border-cable-relleno aria-pressed:bg-cable-relleno aria-pressed:font-semibold aria-pressed:text-sobre-cable";
  const boton =
    "inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border border-borde-control px-4 text-[15px] transition-colors hover:border-cable hover:bg-cable/10 disabled:cursor-default disabled:opacity-40 disabled:hover:border-borde-control disabled:hover:bg-transparent aria-[current=page]:border-cable-relleno aria-[current=page]:bg-cable-relleno aria-[current=page]:font-semibold aria-[current=page]:text-sobre-cable";

  return (
    <div ref={arriba} className="flex scroll-mt-24 flex-col gap-4">
      <div role="group" aria-label={textos.sector} className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={!sector} onClick={() => elegir("")} className={chip}>
          {textos.all}
        </button>
        {sectores.map((s) => (
          <button key={s.clave} type="button" aria-pressed={sector === s.clave} onClick={() => elegir(s.clave)} className={chip}>
            {s.nombre}
          </button>
        ))}
      </div>

      <div aria-live="polite" className="flex min-h-11 flex-wrap items-center gap-3 text-[15px] text-tenue">
        <span>{plantilla(textos.count, { n: filtrados.length, total: ejemplos.length })}</span>
        {sector && (
          <button type="button" onClick={() => elegir("")} className="min-h-11 cursor-pointer rounded-full bg-cable-relleno px-4 font-semibold text-sobre-cable">
            {textos.clear}
          </button>
        )}
      </div>

      {filtrados.length === 0 && <p className="border-t border-linea py-10 text-[17px] text-tenue">{textos.noResults}</p>}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visibles.map((e, i) => (
          <li key={e.id} className="flex">
            <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-linea bg-superficie">
              <div className="relative aspect-[8/5] overflow-hidden bg-chip">
                <Image src={`/ejemplos/${e.id}.webp`} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" priority={i < 3 && actual === 1} className="object-cover object-top" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <span className="font-mono text-xs text-tenue">{e.sectorNombre}</span>
                <h2 className="text-xl font-semibold tracking-tight">{e.nombre}</h2>
                <p className="text-[15px] leading-relaxed">{e.tagline}</p>
                <p className="text-[14px] leading-relaxed text-tenue">{e.detalle}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-5 pt-1">
                  <a href={e.url} target="_blank" rel="noopener" aria-label={`${textos.visit}: ${e.nombre}`} className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-medium text-acento">
                    {textos.visit}
                    <Flecha />
                  </a>
                  <a href={e.repositorio} target="_blank" rel="noopener" aria-label={`${textos.code}: ${e.nombre}`} className="inline-flex min-h-11 items-center text-[15px] hover:text-acento">
                    {textos.code}
                  </a>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>

      {total > 1 && (
        <nav aria-label={textos.pagination} className="flex flex-wrap items-center justify-center gap-2 pt-4">
          <button type="button" onClick={() => ir(actual - 1)} disabled={actual === 1} className={boton}>
            {textos.prev}
          </button>
          {Array.from({ length: total }, (_, k) => k + 1).map((n) => (
            <button key={n} type="button" onClick={() => ir(n)} aria-current={n === actual ? "page" : undefined} aria-label={plantilla(textos.goPage, { n })} className={boton}>
              {n}
            </button>
          ))}
          <button type="button" onClick={() => ir(actual + 1)} disabled={actual === total} className={boton}>
            {textos.next}
          </button>
        </nav>
      )}
    </div>
  );
}
