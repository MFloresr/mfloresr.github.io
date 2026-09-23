# Portfolio · Mario Flores

Portfolio profesional de Mario Flores, desarrollador full-stack en Barcelona.

> **Estado:** en reconstrucción en la rama `v2` (fase 1: esqueleto técnico).
> La web publicada sigue siendo la de `main` hasta que la nueva versión esté aprobada.

## Tecnología

- [Next.js 16](https://nextjs.org) (App Router) y TypeScript.
- Páginas estáticas generadas al compilar, sin base de datos.
- [next-intl](https://next-intl.dev): rutas con prefijo de idioma (`/es`, `/en`).
  El idioma se lee con `next/root-params`, y `proxy.ts` (el antiguo *middleware*) redirige `/` según el navegador.
- Tailwind CSS 4, con modo claro y oscuro sin dependencias extra.
- Vercel para el despliegue.

## Estructura

```text
app/
  [locale]/            páginas por idioma: inicio, projects, about, technologies, blog, contact
    projects/[slug]/   fichas de proyecto (mi-jornada, sudokus, agroclima-consultores)
    blog/[slug]/       artículos (a partir de la fase 6)
    [...rest]/         cualquier otra ruta → 404 traducido
  sitemap.ts, robots.ts
components/layout/     cabecera, navegación, menú móvil, selector de idioma, tema y pie
i18n/                  idiomas (routing.ts), navegación y configuración por petición
messages/              textos de la interfaz: es.json, en.json
lib/sitio.ts           URL base, contacto, secciones y proyectos
proxy.ts               redirección por idioma
```

## Idiomas

- **Publicados:** castellano (`es`) e inglés (`en`).
- **Previstos:** catalán (`ca`) y francés (`fr`). Para añadir uno basta con incluirlo en `i18n/routing.ts`,
  crear `messages/<idioma>.json` y traducir el contenido. Las rutas no cambian: son las mismas en todos
  los idiomas (`/es/projects`, `/en/projects`...).

## Contenido pendiente

Nada se inventa. Lo que aún no está confirmado se muestra con el marcador **Pendiente**
(componente `components/Pendiente.tsx`) y no se publicará así.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit
npm run build
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `SITE_URL` | URL pública, para las URL canónicas, el sitemap y los hreflang. Por defecto `https://marioflores.vercel.app`. Cambiarla es lo único necesario para pasar a un dominio propio. |

## Despliegue

Vercel (proyecto `mfloresr-portfolio`) publica `main` en producción y cada rama en una vista previa.
Las vistas previas no se dejan indexar (`robots.txt`).
