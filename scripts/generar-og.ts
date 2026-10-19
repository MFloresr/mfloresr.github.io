// Genera las imágenes para compartir (Open Graph, 1200×630) de la web en public/og/:
//   site-<idioma>.jpg                    inicio y secciones
//   proyecto-<slug>-<idioma>.jpg         una por proyecto
//   blog-<slug>-<idioma>.jpg             una por artículo publicado
// Se dibujan con Microsoft Edge en modo headless (playwright-core), igual que el CV, a partir del contenido de
// content/ y messages/. Necesita conexión a internet solo para cargar las tipografías de Google Fonts.
// Uso: npm run og
process.env.VERCEL_ENV = "production"; // sin borradores del blog

import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { listarArticulos, listarProyectos, obtenerTecnologias, obtenerPerfil } from "../lib/contenido/leer";
import { nombreTecnologia } from "../lib/contenido/idioma";

const IDIOMAS = ["es", "en", "ca", "fr"] as const;
type Idioma = (typeof IDIOMAS)[number];
const RAIZ = process.cwd();
const SALIDA = path.join(RAIZ, "public", "og");

/** Solo los textos de messages/<idioma>.json que usan las imágenes. */
type Mensajes = {
  meta: { home: { title: string } };
  home: { title: string; status: string; conTitle?: string; cmd?: { projects?: string } };
};
const mensajes = Object.fromEntries(
  IDIOMAS.map((i) => [i, JSON.parse(readFileSync(path.join(RAIZ, "messages", `${i}.json`), "utf-8")) as Mensajes]),
) as Record<Idioma, Mensajes>;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const ETIQUETA_PROYECTO: Record<Idioma, string> = { es: "Proyecto", en: "Project", ca: "Projecte", fr: "Projet" };
const ETIQUETA_BLOG: Record<Idioma, string> = { es: "Artículo", en: "Article", ca: "Article", fr: "Article" };
const MIN: Record<Idioma, string> = { es: "min de lectura", en: "min read", ca: "min de lectura", fr: "min de lecture" };

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600&family=JetBrains+Mono:wght@400;600&family=Orbitron:wght@600;800&display=swap");
*{box-sizing:border-box;margin:0}
html,body{width:1200px;height:630px;overflow:hidden;background:#071033;color:#e8eeff;font-family:"Exo 2",system-ui,sans-serif}
.lienzo{position:relative;width:1200px;height:630px;overflow:hidden;
  background:
    radial-gradient(700px 420px at 92% -10%,rgba(185,123,255,.30),transparent 62%),
    radial-gradient(760px 480px at -8% 112%,rgba(108,155,255,.28),transparent 60%),
    linear-gradient(rgba(108,155,255,.07) 1px,transparent 1px) 0 0/40px 40px,
    linear-gradient(90deg,rgba(108,155,255,.07) 1px,transparent 1px) 0 0/40px 40px,
    #071033}
.cable{position:absolute;left:0;right:0;bottom:0;height:8px;background:linear-gradient(90deg,#b97bff,#6c9bff 60%,#6c9bff)}
.marca{position:absolute;left:72px;bottom:44px;display:flex;flex-direction:column;gap:2px}
.marca b{font-family:Orbitron,sans-serif;font-weight:600;font-size:24px;letter-spacing:.01em}
.marca span{font-family:"JetBrains Mono",monospace;font-size:15px;color:#a9b8f0}
.url{position:absolute;right:72px;bottom:48px;font-family:"JetBrains Mono",monospace;font-size:15px;color:#a9b8f0}
.estado{display:inline-flex;align-items:center;gap:10px;font-family:"JetBrains Mono",monospace;font-size:16px;color:#a9b8f0}
.estado i{width:10px;height:10px;border-radius:50%;background:#4ade9c;box-shadow:0 0 12px #4ade9c}
.etiqueta{display:inline-block;font-family:"JetBrains Mono",monospace;font-size:16px;font-weight:600;color:#071033;background:#6c9bff;border-radius:999px;padding:6px 16px}
h1{font-family:Orbitron,sans-serif;font-weight:800;line-height:1.08;letter-spacing:-.01em}
.fichas{display:flex;flex-wrap:wrap;gap:10px}
.fichas span{font-family:"JetBrains Mono",monospace;font-size:16px;color:#e8eeff;background:#1b2a6b;border:1px solid #2a3c8f;border-radius:8px;padding:6px 12px}
.terminal{position:absolute;right:72px;top:96px;width:430px;background:#040a24;border:1px solid #2a3c8f;border-radius:16px;overflow:hidden;box-shadow:0 30px 70px -30px rgba(0,0,0,.8)}
.terminal .barra{display:flex;align-items:center;gap:8px;padding:14px 18px;border-bottom:1px solid #1b2a6b;font-family:"JetBrains Mono",monospace;font-size:14px;color:#a9b8f0}
.terminal .barra i{width:11px;height:11px;border-radius:50%}
.terminal .cuerpo{padding:20px 22px 24px;font-family:"JetBrains Mono",monospace;font-size:17px;line-height:1.7;color:#e8eeff}
.terminal .p{color:#6c9bff}.terminal .t{color:#b97bff}
.captura{position:absolute;right:56px;top:84px;width:520px;border-radius:14px;overflow:hidden;border:1px solid #2a3c8f;background:#040a24;box-shadow:0 30px 70px -30px rgba(0,0,0,.85)}
.captura .barra{display:flex;gap:7px;padding:11px 14px;background:#101c52}
.captura .barra i{width:10px;height:10px;border-radius:50%}
.captura img{display:block;width:100%;height:390px;object-fit:cover;object-position:top left}
`;

const PUNTOS = `<i style="background:#b97bff"></i><i style="background:#f5b942"></i><i style="background:#4ade9c"></i>`;
const pie = (idioma: Idioma, host: string) =>
  `<div class="marca"><b>Mario Flores</b><span>full-stack · barcelona</span></div><div class="url">${esc(host)}</div><div class="cable"></div>`;

function plantillaSitio(idioma: Idioma, host: string) {
  const m = mensajes[idioma];
  const [, rol] = m.meta.home.title.split(" · ");
  const estado = m.home.status.replace("{ciudad}", "Barcelona");
  // Seis tecnologías destacadas, como mucho dos por grupo, para que se vea el abanico completo
  const porGrupo = new Map<string, number>();
  const tecs = obtenerTecnologias()
    .filter((t) => t.destacada)
    .filter((t) => {
      const n = porGrupo.get(t.grupo) ?? 0;
      porGrupo.set(t.grupo, n + 1);
      return n < 2;
    })
    .slice(0, 6)
    .map((t) => nombreTecnologia(t, idioma));
  const lineas = listarProyectos()
    .map((p) => (p.textos[idioma] ?? p.textos.es!).datos.titulo)
    .slice(0, 4)
    .map((t) => `<div><span class="t">›</span> ${esc(t)}</div>`)
    .join("");
  return `<div class="lienzo">
    <div style="position:absolute;left:72px;top:92px;width:640px;display:flex;flex-direction:column;gap:26px">
      <div class="estado"><i></i>${esc(estado)}</div>
      <h1 style="font-size:70px">${esc(m.home.title)}</h1>
      <div style="font-size:30px;color:#cfd9ff;font-weight:600">${esc(rol ?? "")}</div>
      <div class="fichas">${tecs.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    </div>
    <div class="terminal" style="top:120px"><div class="barra">${PUNTOS}<span style="margin-left:8px">mario@portfolio · ${esc(m.home.conTitle ?? "Consola")}</span></div>
      <div class="cuerpo"><div><span class="p">mario@portfolio ~ $</span> ${esc(m.home.cmd?.projects ?? "proyectos")}</div><div style="margin-top:12px">${lineas}</div></div></div>
    ${pie(idioma, host)}</div>`;
}

function plantillaProyecto(idioma: Idioma, host: string, slug: string) {
  const p = listarProyectos().find((x) => x.slug === slug)!;
  const t = (p.textos[idioma] ?? p.textos.es!).datos;
  const tecs = obtenerTecnologias();
  const nombres = p.datos.tecnologias
    .map((id) => tecs.find((x) => x.id === id)!)
    .filter(Boolean)
    .slice(0, 5)
    .map((x) => nombreTecnologia(x, idioma));
  const captura = p.datos.capturas.find((c) => !c.movil) ?? p.datos.capturas[0];
  const src = pathToFileURL(path.join(RAIZ, "public", "proyectos", slug, captura.archivo)).href;
  return `<div class="lienzo">
    <div style="position:absolute;left:72px;top:92px;width:510px;display:flex;flex-direction:column;gap:22px">
      <div><span class="etiqueta">${esc(ETIQUETA_PROYECTO[idioma])}</span></div>
      <h1 style="font-size:${t.titulo.length > 22 ? 46 : 56}px">${esc(t.titulo)}</h1>
      <div style="font-size:22px;line-height:1.45;color:#cfd9ff;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(t.resumen)}</div>
      <div class="fichas">${nombres.map((n) => `<span>${esc(n)}</span>`).join("")}</div>
    </div>
    <div class="captura"><div class="barra">${PUNTOS}</div><img src="${src}"></div>
    ${pie(idioma, host)}</div>`;
}

function plantillaBlog(idioma: Idioma, host: string, slug: string) {
  const e = listarArticulos().find((x) => x.slug === slug)!;
  const a = e.textos[idioma]!;
  const fecha = new Date(a.datos.fecha).toLocaleDateString(idioma, { year: "numeric", month: "long", day: "numeric" });
  return `<div class="lienzo">
    <div style="position:absolute;left:72px;top:92px;width:1020px;display:flex;flex-direction:column;gap:28px">
      <div style="display:flex;align-items:center;gap:16px"><span class="etiqueta">${esc(ETIQUETA_BLOG[idioma])}</span>
        <span class="estado">${esc(fecha)} · ${a.minutos} ${esc(MIN[idioma])}</span></div>
      <h1 style="font-size:${a.datos.titulo.length > 60 ? 46 : 56}px;max-width:960px">${esc(a.datos.titulo)}</h1>
      <div style="font-size:26px;line-height:1.45;color:#cfd9ff;max-width:900px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(a.datos.resumen)}</div>
    </div>
    ${pie(idioma, host)}</div>`;
}

async function main() {
  obtenerPerfil(); // valida el contenido antes de dibujar
  const host = new URL(process.env.SITE_URL ?? "https://mfloresr.com").host;
  mkdirSync(SALIDA, { recursive: true });
  const trabajos: { archivo: string; html: string }[] = [];
  for (const i of IDIOMAS) trabajos.push({ archivo: `site-${i}.jpg`, html: plantillaSitio(i, host) });
  for (const p of listarProyectos())
    for (const i of IDIOMAS) trabajos.push({ archivo: `proyecto-${p.slug}-${i}.jpg`, html: plantillaProyecto(i, host, p.slug) });
  for (const e of listarArticulos())
    for (const i of IDIOMAS) if (e.textos[i]) trabajos.push({ archivo: `blog-${e.slug}-${i}.jpg`, html: plantillaBlog(i, host, e.slug) });

  const tmp = path.join(tmpdir(), "og-plantilla.html");
  const navegador = await chromium.launch({ channel: "msedge" });
  try {
    const pagina = await (await navegador.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage();
    for (const t of trabajos) {
      writeFileSync(tmp, `<!doctype html><meta charset="utf-8"><style>${CSS}</style>${t.html}`);
      await pagina.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
      await pagina.evaluate(() => document.fonts.ready);
      await pagina.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => {}))));
      const destino = path.join(SALIDA, t.archivo);
      await pagina.screenshot({ path: destino, type: "jpeg", quality: 88 });
      console.log("✓", path.relative(RAIZ, destino));
    }
  } finally {
    await navegador.close();
    rmSync(tmp, { force: true });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
