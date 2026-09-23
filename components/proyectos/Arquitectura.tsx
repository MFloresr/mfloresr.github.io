import { getTranslations } from "next-intl/server";
import type { TextoProyecto } from "@/lib/contenido/esquemas";

/** Diagrama sencillo de las piezas de un proyecto, en fila (escritorio) o en columna (móvil). */
export default async function Arquitectura({ datos }: { datos: NonNullable<TextoProyecto["arquitectura"]> }) {
  const t = await getTranslations("ui");
  return (
    <figure aria-label={t("diagramLabel")} className="m-0 flex flex-col gap-2.5">
      <ol className="flex flex-col gap-2.5 md:flex-row md:items-stretch">
        {datos.nodos.map((nodo, i) => (
          <li key={nodo.titulo} className="flex flex-1 flex-col gap-2.5 md:flex-row md:items-center">
            <div
              className={`flex flex-1 flex-col gap-1 self-stretch rounded-xl border p-4 ${
                nodo.destacado ? "border-acento bg-acento-suave" : "border-linea bg-superficie"
              }`}
            >
              <strong className="text-[15px] font-semibold">{nodo.titulo}</strong>
              <span className="font-mono text-xs leading-normal text-tenue">{nodo.detalle}</span>
            </div>
            {i < datos.nodos.length - 1 && (
              <span aria-hidden="true" className="self-center font-mono text-sm text-tenue">
                <span className="md:hidden">↕</span>
                <span className="hidden md:inline">⇄</span>
              </span>
            )}
          </li>
        ))}
      </ol>
      {datos.nota && <figcaption className="font-mono text-xs text-tenue">{datos.nota}</figcaption>}
    </figure>
  );
}
