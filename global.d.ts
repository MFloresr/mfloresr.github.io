import type { routing } from "@/i18n/routing";
import type messages from "./messages/es.json";

// Tipos de next-intl: idiomas válidos y claves de texto comprobadas al compilar
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
