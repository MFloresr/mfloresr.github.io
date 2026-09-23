import { getTranslations } from "next-intl/server";
import { Flecha } from "@/components/ui/Iconos";

const NODOS = ["frontend", "backend", "database", "deploy", "systems"] as const;

/**
 * Del frontend a los sistemas: las cuatro primeras piezas son el perfil principal
 * (desarrollo full-stack) y la última, el complemento (sistemas y soporte).
 */
export default async function DiagramaPerfil() {
  const t = await getTranslations("home.diagram");
  const clase = (i: number) =>
    i < 4 ? "border-acento bg-acento-suave" : "border-linea bg-chip";

  return (
    <figure aria-label={t("label")} className="m-0 flex flex-col gap-3">
      {/* Escritorio: en fila con flechas */}
      <ol className="hidden items-center gap-2.5 md:flex">
        {NODOS.map((n, i) => (
          <li key={n} className="flex flex-1 items-center gap-2.5">
            <span className={`flex-1 rounded-xl border px-3 py-4 text-center text-[15px] font-medium ${clase(i)}`}>{t(n)}</span>
            {i < NODOS.length - 1 && (
              <span className="text-tenue">
                <Flecha />
              </span>
            )}
          </li>
        ))}
      </ol>
      <div className="hidden grid-cols-[4fr_1fr] gap-2.5 font-mono text-xs text-tenue md:grid">
        <span className="border-t-2 border-acento pt-2">{t("main")}</span>
        <span className="border-t-2 border-tenue pt-2">{t("plus")}</span>
      </div>

      {/* Móvil: en columna numerada */}
      <ol className="flex flex-col gap-2 md:hidden">
        {NODOS.map((n, i) => (
          <li key={n} className="flex items-center gap-3">
            <span className="w-6 font-mono text-xs text-tenue">0{i + 1}</span>
            <span className={`flex-1 rounded-[10px] border px-3.5 py-3 text-[15px] font-medium ${clase(i)}`}>{t(n)}</span>
          </li>
        ))}
      </ol>
      <figcaption className="font-mono text-xs leading-relaxed text-tenue md:hidden">
        01–04 {t("main")} · 05 {t("plus")}
      </figcaption>
    </figure>
  );
}
