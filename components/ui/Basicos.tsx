import Image from "next/image";
import { getTranslations } from "next-intl/server";

/** Etiqueta de sección: "01 · Proyectos". */
export function Etiqueta({ numero, children }: { numero: string; children: React.ReactNode }) {
  return (
    <span className="font-mono text-[13px] text-acento">
      {numero} · {children}
    </span>
  );
}

/** Lista con guiones de color de acento. */
export function ListaGuion({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-col gap-2 ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 leading-relaxed">
          <span aria-hidden="true" className="text-acento">
            —
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Etiquetas de tecnologías; con `max`, muestra las primeras y "+N". */
export function Chips({ items, max, pequenas }: { items: string[]; max?: number; pequenas?: boolean }) {
  const visibles = max ? items.slice(0, max) : items;
  const resto = items.length - visibles.length;
  const tam = pequenas ? "text-xs" : "text-[13px]";
  return (
    <ul className="flex flex-wrap gap-1.5">
      {visibles.map((item) => (
        <li key={item} className={`rounded-md bg-chip px-2 py-0.5 font-mono text-texto ${tam}`}>
          {item}
        </li>
      ))}
      {resto > 0 && <li className={`px-1 py-0.5 font-mono text-tenue ${tam}`}>+{resto}</li>}
    </ul>
  );
}

/**
 * Captura de un proyecto (public/proyectos/<slug>/<archivo>), recortada por arriba para llenar
 * la caja que marca `className`. Sin captura, muestra el hueco de "pendiente".
 */
export async function Captura({
  slug,
  captura,
  className = "",
  sizes = "100vw",
  prioridad = false,
}: {
  slug?: string;
  captura?: { archivo: string; alt: string } | null;
  className?: string;
  sizes?: string;
  prioridad?: boolean;
}) {
  if (slug && captura) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-linea bg-chip ${className}`}>
        <Image
          src={`/proyectos/${slug}/${captura.archivo}`}
          alt={captura.alt}
          fill
          sizes={sizes}
          preload={prioridad}
          className="object-cover object-top"
        />
      </div>
    );
  }
  const t = await getTranslations("ui");
  return (
    <div className={`flex items-center justify-center rounded-xl border border-dashed border-linea bg-chip px-4 text-center ${className}`}>
      <span className="font-mono text-xs text-tenue">{t("screenshotPending")}</span>
    </div>
  );
}
