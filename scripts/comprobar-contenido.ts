/**
 * Comprueba el contenido de content/ y lista lo que falta.
 *
 *   npm run contenido              → valida y muestra los pendientes (no falla por ellos)
 *   npm run contenido -- --estricto → además falla si queda algo pendiente (antes de publicar)
 *
 * Si algún archivo no cumple su esquema, falla siempre, igual que el build.
 */
import { routing } from "../i18n/routing";
import { listarProyectos, obtenerPerfil, obtenerTecnologias } from "../lib/contenido/leer";

const estricto = process.argv.includes("--estricto");
const pendientes: string[] = [];
const idiomas = routing.locales;

const perfil = obtenerPerfil();
const tecnologias = obtenerTecnologias();

for (const [campo, valor] of Object.entries(perfil.contacto)) {
  if (valor === null) pendientes.push(`perfil.contacto.${campo}`);
}
for (const campo of ["rol", "mensaje", "busca", "desarrollo", "complementario"] as const) {
  for (const idioma of idiomas) if (!perfil[campo][idioma]) pendientes.push(`perfil.${campo} [${idioma}]`);
}
perfil.formacion.forEach((f, i) => {
  if (!f.centro) pendientes.push(`perfil.formacion[${i}].centro`);
  if (!f.fechas) pendientes.push(`perfil.formacion[${i}].fechas`);
  for (const idioma of idiomas) if (!f.titulo[idioma]) pendientes.push(`perfil.formacion[${i}].titulo [${idioma}]`);
});

const proyectos = listarProyectos();
for (const p of proyectos) {
  if (p.datos.capturas.length === 0) pendientes.push(`${p.slug}: capturas`);
  for (const idioma of idiomas) {
    const texto = p.textos[idioma];
    if (!texto) {
      pendientes.push(`${p.slug}: traducción [${idioma}]`);
      continue;
    }
    if (!texto.datos.revisado) pendientes.push(`${p.slug} [${idioma}]: revisión de Mario`);
    for (const [campo, valor] of Object.entries(texto.datos)) {
      if (valor === null && campo !== "contexto") pendientes.push(`${p.slug} [${idioma}]: ${campo}`);
    }
  }
}

console.log(`Contenido válido: ${tecnologias.length} tecnologías, ${proyectos.length} proyectos, idiomas ${idiomas.join(", ")}.`);
if (pendientes.length) {
  console.log(`\nPendiente (${pendientes.length}):`);
  for (const p of pendientes) console.log(`  · ${p}`);
} else {
  console.log("\nNo queda nada pendiente.");
}
if (estricto && pendientes.length) {
  console.error("\nModo estricto: resuelve lo pendiente antes de publicar.");
  process.exit(1);
}
