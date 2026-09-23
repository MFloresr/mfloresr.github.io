import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// En Next.js 16 el middleware se llama "proxy". Redirige "/" y las rutas sin idioma
// al idioma preferido del navegador (o al castellano por defecto).
export default createMiddleware(routing);

export const config = {
  // Todo salvo rutas internas y archivos con extensión (imágenes, sitemap.xml, robots.txt...)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
