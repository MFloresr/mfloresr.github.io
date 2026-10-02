"use client";

import { useEffect, useRef } from "react";

/** Barra fina arriba de la página que muestra cuánto del artículo se ha leído. */
export default function BarraProgreso({ objetivo }: { objetivo: string }) {
  const barra = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let pendiente = false;
    const calcular = () => {
      pendiente = false;
      const el = document.querySelector(objetivo);
      if (!el || !barra.current) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const leido = Math.min(1, Math.max(0, total > 0 ? -r.top / total : 0));
      barra.current.style.transform = `scaleX(${leido})`;
    };
    const alMover = () => {
      if (!pendiente) {
        pendiente = true;
        requestAnimationFrame(calcular);
      }
    };
    calcular();
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    return () => {
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
    };
  }, [objetivo]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1">
      <div ref={barra} className="h-full origin-left scale-x-0 bg-linear-to-r from-cable-2 to-cable-relleno" />
    </div>
  );
}
