"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type CapturaGaleria = { src: string; alt: string; movil: boolean };
type Textos = { open: string; close: string; prev: string; next: string; counter: string; title: string };

const plantilla = (texto: string, valores: Record<string, string | number>) => texto.replace(/\{(\w+)\}/g, (_, k: string) => String(valores[k] ?? ""));

/**
 * Capturas de un proyecto: la principal grande y el resto debajo. Al pulsar una se abre ampliada
 * en una ventana con flechas, contador y cierre con Esc. Funciona con el teclado (← → y Esc).
 */
export default function GaleriaCapturas({ capturas, textos }: { capturas: CapturaGaleria[]; textos: Textos }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [indice, setIndice] = useState<number | null>(null);
  const [principal, ...resto] = capturas;
  const escritorio = resto.filter((c) => !c.movil);
  const movil = resto.filter((c) => c.movil);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (indice !== null && !d.open) d.showModal();
    if (indice === null && d.open) d.close();
  }, [indice]);

  const mover = (paso: number) => setIndice((i) => (i === null ? i : (i + paso + capturas.length) % capturas.length));
  const actual = indice === null ? null : capturas[indice];

  const miniatura = (c: CapturaGaleria, i: number, clases: string, tamanos: string, prioridad = false) => (
    <button
      key={c.src}
      type="button"
      onClick={() => setIndice(i)}
      aria-label={plantilla(textos.open, { alt: c.alt })}
      className={`group relative cursor-zoom-in overflow-hidden rounded-xl border border-linea bg-chip ${clases}`}
    >
      <Image src={c.src} alt="" fill sizes={tamanos} priority={prioridad} className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none" />
    </button>
  );

  return (
    <>
      {miniatura(principal, 0, "mt-4 block aspect-[16/10] w-full", "(min-width: 1280px) 1200px, 100vw", true)}
      {(escritorio.length > 0 || movil.length > 0) && (
        <div className="flex items-start gap-4">
          {escritorio.map((c) => miniatura(c, capturas.indexOf(c), "aspect-[16/10] flex-1", "(min-width: 1280px) 900px, 75vw"))}
          {movil.map((c) => miniatura(c, capturas.indexOf(c), "aspect-[390/844] w-[22%] shrink-0", "25vw"))}
        </div>
      )}

      <dialog
        ref={dialogo}
        aria-label={textos.title}
        onClose={() => setIndice(null)}
        onClick={(e) => {
          if (e.target === dialogo.current) setIndice(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") mover(1);
          if (e.key === "ArrowLeft") mover(-1);
        }}
        className="m-auto w-[min(72rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-linea bg-superficie p-0 text-texto backdrop:bg-black/80"
      >
        {actual && (
          <div className="flex flex-col">
            <div className="relative h-[72vh] bg-chip">
              <Image src={actual.src} alt={actual.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p aria-live="polite" className="min-w-0 flex-1 text-[15px] text-tenue">
                <span className="font-semibold text-texto">{plantilla(textos.counter, { n: (indice ?? 0) + 1, total: capturas.length })}</span> · {actual.alt}
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => mover(-1)} aria-label={textos.prev} className="min-h-11 min-w-11 cursor-pointer rounded-md border border-borde-control px-3 hover:border-cable">
                  ←
                </button>
                <button type="button" onClick={() => mover(1)} aria-label={textos.next} className="min-h-11 min-w-11 cursor-pointer rounded-md border border-borde-control px-3 hover:border-cable">
                  →
                </button>
                <button type="button" onClick={() => setIndice(null)} className="min-h-11 cursor-pointer rounded-md bg-cable-relleno px-4 font-semibold text-sobre-cable">
                  {textos.close}
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
