"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

/** Botón y panel del menú en pantallas pequeñas. Recibe los enlaces ya renderizados. */
export default function MenuMovil({ children }: { children: React.ReactNode }) {
  const t = useTranslations("nav");
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const [rutaAnterior, setRutaAnterior] = useState(ruta);

  // Cierra el menú al navegar
  if (ruta !== rutaAnterior) {
    setRutaAnterior(ruta);
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [abierto]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        aria-label={abierto ? t("closeMenu") : t("openMenu")}
        className="flex size-9 items-center justify-center rounded-md text-tenue hover:bg-linea hover:text-texto"
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <div id="menu-movil" hidden={!abierto} className="absolute inset-x-0 top-full border-b border-linea bg-fondo px-4 pb-4">
        {children}
      </div>
    </div>
  );
}
