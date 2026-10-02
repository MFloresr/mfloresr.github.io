"use client";

import { useEffect, useState } from "react";
import type { EntradaIndice } from "@/lib/contenido/mdx";

/** Índice del artículo: marca el apartado que se está leyendo. En pantallas pequeñas es un desplegable. */
export default function IndiceLateral({ indice, titulo }: { indice: EntradaIndice[]; titulo: string }) {
  const [activo, setActivo] = useState(indice[0]?.id ?? "");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const elementos = indice.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e));
    const io = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActivo(visible.target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    elementos.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [indice]);

  const lista = (
    <ol className="flex flex-col gap-0.5 text-[15px]">
      {indice.map((i) => (
        <li key={i.id} className={i.nivel === 3 ? "pl-4" : undefined}>
          <a
            href={`#${i.id}`}
            aria-current={activo === i.id ? "location" : undefined}
            className={`flex min-h-11 items-center rounded-md border-l-2 px-3 transition-colors hover:text-texto ${
              activo === i.id ? "border-cable-relleno bg-cable-relleno/10 font-semibold text-texto" : "border-transparent text-tenue"
            }`}
          >
            {i.texto}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className="rounded-xl border border-linea bg-superficie lg:hidden">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 font-semibold">{titulo}</summary>
        <nav aria-label={titulo} className="px-2 pb-3">
          {lista}
        </nav>
      </details>
      <nav aria-label={titulo} className="sticky top-28 hidden self-start lg:block">
        <p className="px-3 pb-2 text-[13px] font-semibold text-tenue">{titulo}</p>
        {lista}
      </nav>
    </>
  );
}
