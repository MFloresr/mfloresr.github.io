// Iconos de trazo (heredan el color del texto). Decorativos: aria-hidden.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function Flecha({ tam = 16 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" {...base}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Descargar({ tam = 14 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" {...base}>
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}

export function Externo({ tam = 14 }: { tam?: number }) {
  return (
    <svg width={tam} height={tam} viewBox="0 0 24 24" {...base}>
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}
