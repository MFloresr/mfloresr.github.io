// Genera el CV en PDF (A4, una página) en castellano e inglés a partir de cv/plantilla.html
// y cv/datos.js, con Microsoft Edge en modo headless (playwright-core, sin descargar navegadores).
// Uso: npm run cv  →  public/cv/mario-flores-cv-es.pdf y public/cv/mario-flores-cv-en.pdf
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const plantilla = pathToFileURL(path.join(raiz, "cv", "plantilla.html")).href;
const salida = path.join(raiz, "public", "cv");
const ALTO_A4 = 1123; // px a 96 ppp

await mkdir(salida, { recursive: true });
const navegador = await chromium.launch({ channel: "msedge" });
try {
  for (const idioma of ["es", "en"]) {
    const pagina = await navegador.newPage();
    await pagina.goto(`${plantilla}?lang=${idioma}`, { waitUntil: "networkidle" });
    await pagina.evaluate(() => document.fonts.ready);
    // Comprobar que todo cabe en una página: el último bloque de cada columna debe acabar dentro del A4
    const desborde = await pagina.evaluate(() =>
      Math.round(
        Math.max(
          ...[...document.querySelectorAll(".lateral, .principal")].map((c) => c.lastElementChild.getBoundingClientRect().bottom),
        ),
      ),
    );
    if (desborde > ALTO_A4) throw new Error(`CV ${idioma}: el contenido mide ${desborde}px y no cabe en una página A4 (${ALTO_A4}px)`);
    const archivo = path.join(salida, `mario-flores-cv-${idioma}.pdf`);
    // pageRanges: "1" evita una segunda página en blanco por redondeo de la altura A4
    await pagina.pdf({ path: archivo, format: "A4", printBackground: true, preferCSSPageSize: true, pageRanges: "1" });
    console.log(`✓ ${path.relative(raiz, archivo)} (alto ${desborde}px de ${ALTO_A4})`);
    await pagina.close();
  }
} finally {
  await navegador.close();
}
