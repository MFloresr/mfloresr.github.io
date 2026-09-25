"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Motivos de error que devuelven las rutas /api/ia/*. */
export type MotivoError = "no-configurada" | "limite" | "saturada" | "fallo" | "origen" | "demasiadas" | "datos" | "red";

/** Llama a una ruta de IA y devuelve los datos o el motivo del error. */
export async function llamarIA<T>(ruta: string, cuerpo: object): Promise<{ datos: T } | { error: MotivoError }> {
  try {
    const res = await fetch(ruta, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { error: (json as { error?: MotivoError }).error ?? "fallo" };
    return { datos: json as T };
  } catch {
    return { error: "red" };
  }
}

/** Mensaje de error traducido. */
export function AvisoError({ motivo }: { motivo: MotivoError }) {
  const t = useTranslations("ai.errors");
  return (
    <p role="alert" className="rounded-xl border border-pendiente-borde bg-pendiente-fondo px-4 py-3 text-[15px] text-pendiente-texto">
      {t(motivo)}
    </p>
  );
}

/** Enlaces a las fichas de los proyectos citados. */
export function EnlacesProyectos({ slugs, titulos }: { slugs: string[]; titulos: Record<string, string> }) {
  if (!slugs.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {slugs.map((s) => (
        <li key={s}>
          <Link
            href={`/projects/${s}`}
            className="inline-flex items-center rounded-md border border-linea bg-superficie px-2 py-0.5 font-mono text-xs text-acento hover:border-acento"
          >
            {titulos[s] ?? s}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Campo trampa contra bots: invisible y fuera del orden de tabulación.
 * Las personas nunca lo rellenan; si llega con texto, el servidor rechaza la petición.
 */
export function CampoTrampa({ valor, alCambiar }: { valor: string; alCambiar: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Web
        <input type="text" name="web" tabIndex={-1} autoComplete="off" value={valor} onChange={(e) => alCambiar(e.target.value)} />
      </label>
    </div>
  );
}

export function Cargando({ texto }: { texto: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      {texto}
    </span>
  );
}
