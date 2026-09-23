import { getTranslations } from "next-intl/server";

/**
 * Marcador visible de contenido que aún no existe. No se inventa texto:
 * todo lo que falta aparece así hasta que Mario lo confirma.
 */
export default async function Pendiente({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("pending");
  return (
    <p
      className="rounded-lg border border-dashed border-pendiente-borde bg-pendiente-fondo px-4 py-3 text-sm text-pendiente-texto"
      data-pendiente
    >
      <strong className="font-semibold">{t("label")}:</strong> {children}
    </p>
  );
}
