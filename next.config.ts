import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl lee la configuración de cada petición desde i18n/request.ts
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {};

export default withNextIntl(nextConfig);
