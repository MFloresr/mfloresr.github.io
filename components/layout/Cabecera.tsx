import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { obtenerPerfil } from "@/lib/contenido/leer";
import BotonTema from "./BotonTema";
import { BotonPaleta } from "./Paleta";
import EnlacesNav from "./EnlacesNav";
import MenuMovil from "./MenuMovil";
import SelectorIdioma from "./SelectorIdioma";

export default async function Cabecera() {
  const t = await getTranslations("nav");
  const tPaleta = await getTranslations("palette");
  const perfil = obtenerPerfil();
  const ciudad = perfil.ubicacion.split(",")[0].toLowerCase();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-cable bg-barra text-sobre-barra shadow-[0_6px_28px_-10px_var(--brillo)]">
      <div className="contenedor flex min-h-16 flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 md:min-h-19">
        <Link href="/" className="flex min-h-11 flex-col justify-center gap-0.5">
          <span className="font-display text-sm font-bold tracking-wide whitespace-nowrap sm:text-base">{perfil.nombre}</span>
          <span className="hidden text-xs opacity-70 sm:block">full-stack · {ciudad}</span>
        </Link>

        <nav aria-label={t("label")} className="hidden xl:block">
          <EnlacesNav />
        </nav>

        <div className="flex items-center gap-0.5">
          <BotonPaleta etiqueta={tPaleta("open")} />
          <div className="hidden sm:block">
            <SelectorIdioma />
          </div>
          <BotonTema />
          <MenuMovil>
            <nav aria-label={t("label")}>
              <EnlacesNav vertical />
            </nav>
            <div className="pt-3 sm:hidden">
              <SelectorIdioma />
            </div>
          </MenuMovil>
        </div>
      </div>
    </header>
  );
}
