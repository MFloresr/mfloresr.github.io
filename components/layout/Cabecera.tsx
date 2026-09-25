import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { obtenerPerfil } from "@/lib/contenido/leer";
import BotonTema from "./BotonTema";
import EnlacesNav from "./EnlacesNav";
import MenuMovil from "./MenuMovil";
import SelectorIdioma from "./SelectorIdioma";

export default async function Cabecera() {
  const t = await getTranslations("nav");
  const perfil = obtenerPerfil();
  const ciudad = perfil.ubicacion.split(",")[0].toLowerCase();

  return (
    <header className="relative border-b border-linea">
      <div className="contenedor flex h-16 items-center justify-between gap-4 md:h-19">
        <Link href="/" className="flex flex-col gap-0.5">
          <span className="text-[17px] font-semibold tracking-tight">{perfil.nombre}</span>
          <span className="font-mono text-xs text-tenue">full-stack · {ciudad}</span>
        </Link>

        <nav aria-label={t("label")} className="hidden xl:block">
          <EnlacesNav />
        </nav>

        <div className="flex items-center gap-0.5">
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
