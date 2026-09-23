import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import Cabecera from "@/components/layout/Cabecera";
import Pie from "@/components/layout/Pie";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Aplica el tema guardado (o el del sistema) antes de pintar, para evitar parpadeos
const scriptTema = `try{var t=localStorage.getItem("tema");if(!t)t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LayoutIdioma({ children }: LayoutProps<"/[locale]">) {
  const idioma = await getLocale();
  const t = await getTranslations("nav");

  return (
    <html lang={idioma} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-superficie focus:px-4 focus:py-2"
          >
            {t("skipToContent")}
          </a>
          <Cabecera />
          <main id="contenido" className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
            {children}
          </main>
          <Pie />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
