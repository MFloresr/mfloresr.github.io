"use client";

import { useRef, useState } from "react";

/** Envuelve un bloque de código ya resaltado y le añade un botón para copiarlo. */
export default function BloqueCodigo({ children, textos }: { children: React.ReactNode; textos: { copiar: string; copiado: string; etiqueta: string } }) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    const texto = contenedor.current?.querySelector("pre")?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // Sin permiso para el portapapeles, el código sigue pudiéndose seleccionar a mano
    }
  }

  return (
    <div ref={contenedor} className="relative">
      {children}
      <button
        type="button"
        onClick={copiar}
        aria-label={textos.etiqueta}
        className="absolute top-2 right-2 min-h-11 cursor-pointer rounded-md border border-borde-control bg-superficie px-3 text-[13px] font-semibold hover:border-cable"
      >
        {copiado ? textos.copiado : textos.copiar}
      </button>
      <span aria-live="polite" className="sr-only">
        {copiado ? textos.copiado : ""}
      </span>
    </div>
  );
}
