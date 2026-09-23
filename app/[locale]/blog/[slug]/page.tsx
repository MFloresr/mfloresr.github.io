import { notFound } from "next/navigation";

// Aún no hay artículos: todas las rutas de artículo dan 404 hasta la fase 6
export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return [];
}

export default async function PaginaArticulo() {
  notFound();
}
