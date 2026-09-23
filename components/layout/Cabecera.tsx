import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NOMBRE } from "@/lib/sitio";
import BotonTema from "./BotonTema";
import EnlacesNav from "./EnlacesNav";
import MenuMovil from "./MenuMovil";
import SelectorIdioma from "./SelectorIdioma";

export default async function Cabecera() {
  const t = await getTranslations("nav");

  return (
    <header className="relative border-b border-linea">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          {NOMBRE}
        </Link>

        <nav aria-label={t("label")} className="hidden md:block">
          <EnlacesNav />
        </nav>

        <div className="flex items-center gap-1">
          <SelectorIdioma />
          <BotonTema />
          <MenuMovil>
            <nav aria-label={t("label")}>
              <EnlacesNav vertical />
            </nav>
          </MenuMovil>
        </div>
      </div>
    </header>
  );
}
