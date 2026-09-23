import { getTranslations } from "next-intl/server";

/**
 * Marcador visible de contenido que aún no existe. No se inventa texto:
 * todo lo que falta aparece así hasta que Mario lo confirma.
 */
export default async function Pendiente({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const t = await getTranslations("pending");
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-pendiente-borde bg-pendiente-fondo px-2.5 py-1 text-[13px] text-pendiente-texto ${className}`}
      data-pendiente
    >
      <strong className="font-semibold">{t("label")}:</strong> {children}
    </span>
  );
}
