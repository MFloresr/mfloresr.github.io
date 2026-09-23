"use client";

import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

type Tema = "light" | "dark";

function temaActual(): Tema {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function suscribir(avisar: () => void) {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observador.disconnect();
}

/** Alterna entre modo claro y oscuro y lo recuerda en este navegador. */
export default function BotonTema() {
  const t = useTranslations("theme");
  const tema = useSyncExternalStore<Tema | null>(suscribir, temaActual, () => null);

  function alternar() {
    const nuevo: Tema = temaActual() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nuevo;
    try {
      localStorage.setItem("tema", nuevo);
    } catch {
      // Sin almacenamiento el tema dura solo esta visita
    }
  }

  const etiqueta = tema === "dark" ? t("toLight") : t("toDark");

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={etiqueta}
      title={etiqueta}
      className="flex size-9 items-center justify-center rounded-md text-tenue hover:bg-linea hover:text-texto"
    >
      {/* Sol en modo oscuro, luna en modo claro (se decide por CSS para evitar parpadeos) */}
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="hidden dark:block">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M5 5l1.4 1.4M17.6 17.6 19 19M3 12h2M19 12h2M5 19l1.4-1.4M17.6 6.4 19 5" />
      </svg>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="dark:hidden">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
