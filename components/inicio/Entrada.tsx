"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Título de la portada: «Del cable / al navegador.» con un cable luminoso que se dibuja desde un conector
 * de red hasta una ventana de navegador. Los extremos se miden en pantalla, así que el trazo sigue al texto
 * en cualquier ancho. Con «reducir movimiento» el cable aparece ya dibujado y sin paquetes de datos.
 */
export default function Entrada({ linea1, linea2 }: { linea1: string; linea2: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const enchufe = useRef<HTMLSpanElement>(null);
  const navegador = useRef<HTMLSpanElement>(null);
  const trazo = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{ d: string; x1: number; x2: number; ancho: number; alto: number } | null>(null);
  const [largo, setLargo] = useState(0);
  const [quieto, setQuieto] = useState(false);
  // Cada línea mide ≈0,58 em por letra más el icono; el tamaño sale de la línea más ancha para que nunca se parta
  const divisor = Math.max(linea1.length * 0.58 + 1.0, linea2.length * 0.58 + 1.26) * 1.03;

  useEffect(() => {
    const contenedor = caja.current;
    const a = enchufe.current;
    const b = navegador.current;
    if (!contenedor || !a || !b) return;
    setQuieto(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const medir = () => {
      const c = contenedor.getBoundingClientRect();
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const sx = ra.right - c.left;
      const sy = ra.top + ra.height / 2 - c.top;
      const ex = rb.left + rb.width / 2 - c.left;
      const ey = rb.top - c.top + 1;
      const dx = Math.max(40, Math.abs(ex - sx) * 0.55);
      const dy = Math.max(30, (ey - sy) * 0.5);
      const d = `M${sx.toFixed(1)} ${sy.toFixed(1)} C${(sx + dx).toFixed(1)} ${sy.toFixed(1)} ${ex.toFixed(1)} ${(ey - dy).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      setGeo({ d, x1: sx, x2: ex, ancho: c.width, alto: c.height });
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(contenedor);
    document.fonts?.ready.then(medir);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (trazo.current) setLargo(Math.ceil(trazo.current.getTotalLength()));
  }, [geo?.d]);

  return (
    <div ref={caja} className="relative [container-type:inline-size]">
      <h1 className="entrada-titulo font-display leading-[1.02] font-bold tracking-[-0.01em]" style={{ fontSize: `clamp(1.6rem, calc(100cqw / ${divisor.toFixed(2)}), 8rem)` }}>
        <span className="entrada-linea flex items-center gap-x-[0.28em] whitespace-nowrap" style={{ animationDelay: "0.05s" }}>
          {linea1}
          <span ref={enchufe} aria-hidden="true" className="inline-block h-[0.78em] w-[0.72em]">
            <svg viewBox="0 0 48 56" className="size-full overflow-visible" fill="none" stroke="var(--cable)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
              <rect x="3" y="12" width="34" height="32" rx="5" fill="var(--superficie)" fillOpacity="0.55" />
              <path d="M14 12V6h12v6" />
              <path d="M11 44v-9M17 44v-9M23 44v-9M29 44v-9" strokeWidth="2.4" />
              <path d="M37 28h9" />
            </svg>
          </span>
        </span>
        <span className="entrada-linea flex items-center gap-x-[0.28em] whitespace-nowrap" style={{ animationDelay: "0.2s" }}>
          {linea2}
          <span ref={navegador} aria-hidden="true" className={`entrada-ventana inline-block h-[0.78em] w-[0.98em] ${geo ? "entrada-ventana-viva" : ""}`}>
            <svg viewBox="0 0 64 50" className="size-full overflow-visible" fill="none" stroke="var(--cable)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round">
              <rect x="2" y="3" width="60" height="44" rx="7" fill="var(--superficie)" fillOpacity="0.55" />
              <path d="M2 17h60" strokeWidth="2.4" />
              <path d="M10 10h.01M17 10h.01M24 10h.01" strokeWidth="4" />
              <path d="M11 27h26M11 35h40" strokeWidth="2.4" stroke="var(--cable-2)" />
            </svg>
          </span>
        </span>
      </h1>

      {geo && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible" width={geo.ancho} height={geo.alto} viewBox={`0 0 ${geo.ancho} ${geo.alto}`}>
          <defs>
            <linearGradient id="entrada-degradado" gradientUnits="userSpaceOnUse" x1={geo.x1} y1="0" x2={geo.x2} y2="0">
              <stop offset="0" stopColor="var(--cable)" />
              <stop offset="1" stopColor="var(--cable-2)" />
            </linearGradient>
          </defs>
          <path
            ref={trazo}
            d={geo.d}
            className="entrada-cable"
            style={{ ["--largo" as string]: largo || 1000, opacity: largo ? 1 : 0 }}
            stroke="url(#entrada-degradado)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {!quieto &&
            largo > 0 &&
            [0, 1.1, 2.2].map((retraso) => (
              <circle key={retraso} r="5" className="pulso" opacity="0">
                <animateMotion dur="3.3s" begin={`${2.1 + retraso}s`} repeatCount="indefinite" path={geo.d} />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="3.3s" begin={`${2.1 + retraso}s`} repeatCount="indefinite" />
              </circle>
            ))}
        </svg>
      )}
    </div>
  );
}
