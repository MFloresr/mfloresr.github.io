import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl lee la configuración de cada petición desde i18n/request.ts
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // El dominio propio es el canónico: la dirección antigua de Vercel redirige a él conservando la ruta.
  // Solo afecta a ese host; las vistas previas (otros hosts de vercel.app) siguen funcionando.
  async redirects() {
    return [
      // Idiomas retirados (catalán y francés): las URL antiguas ya indexadas pasan a castellano e inglés
      { source: "/ca/:path*", destination: "/es/:path*", permanent: true },
      { source: "/fr/:path*", destination: "/en/:path*", permanent: true },
      {
        source: "/:path*",
        has: [{ type: "host", value: "mfloresr-portfolio.vercel.app" }],
        destination: "https://mfloresr.com/:path*",
        permanent: true,
      },
    ];
  },
  // Las rutas de IA leen el contenido (content/ y el CV) al ejecutarse: hay que incluirlo en la función.
  // Las capturas también, porque la lectura de proyectos comprueba que existen.
  outputFileTracingIncludes: {
    "/api/ia/*": ["./content/**/*", "./cv/datos.js", "./public/proyectos/**/*"],
  },
};

export default withNextIntl(nextConfig);
