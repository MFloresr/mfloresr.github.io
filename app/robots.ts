import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/sitio";

// Solo la versión de producción se deja indexar; las vistas previas de Vercel no
export default function robots(): MetadataRoute.Robots {
  const produccion = process.env.VERCEL_ENV === "production";
  return {
    rules: produccion ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
