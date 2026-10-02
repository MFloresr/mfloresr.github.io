"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const ENLACES = [
  { href: "/", clave: "home" },
  { href: "/projects", clave: "projects" },
  { href: "/about", clave: "about" },
  { href: "/technologies", clave: "technologies" },
  { href: "/blog", clave: "blog" },
  { href: "/ask", clave: "ask" },
  { href: "/contact", clave: "contact" },
] as const;

/** Enlaces de la navegación principal; marca la sección actual. */
export default function EnlacesNav({ vertical = false }: { vertical?: boolean }) {
  const t = useTranslations("nav");
  const ruta = usePathname();

  return (
    <ul className={vertical ? "flex flex-col gap-1 pt-2" : "flex items-center gap-1"}>
      {ENLACES.map(({ href, clave }) => {
        const actual = href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={actual ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors ${
                actual
                  ? "border-cable-relleno bg-cable-relleno text-sobre-cable"
                  : "border-transparent hover:border-cable-relleno hover:bg-cable-relleno/15"
              } ${vertical ? "text-base" : ""}`}
            >
              {t(clave)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
