import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NoEncontrada() {
  const t = await getTranslations("notFound");
  return (
    <div className="contenedor flex flex-col items-start gap-4 py-16">
      <p className="text-sm font-semibold text-tenue">404</p>
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-tenue">{t("text")}</p>
      <Link href="/" className="font-medium text-acento underline underline-offset-4">
        {t("back")}
      </Link>
    </div>
  );
}
