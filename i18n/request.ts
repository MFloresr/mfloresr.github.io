import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";
import { routing } from "./routing";

/**
 * Configuración de next-intl para cada petición: idioma (desde el segmento [locale])
 * y textos de la interfaz (messages/<idioma>.json). Un idioma no publicado da 404.
 */
export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    const valor = await rootParams.locale();
    if (hasLocale(routing.locales, valor)) {
      locale = valor;
    } else {
      notFound();
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
