import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Versiones de Link, redirect, etc. que añaden el prefijo de idioma automáticamente
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
