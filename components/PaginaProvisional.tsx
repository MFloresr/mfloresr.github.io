import Pendiente from "./Pendiente";

/** Página del esqueleto: título real de la sección y el contenido marcado como pendiente. */
export default function PaginaProvisional({ titulo, pendiente }: { titulo: string; pendiente: string }) {
  return (
    <div className="contenedor flex flex-col gap-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">{titulo}</h1>
      <Pendiente>{pendiente}</Pendiente>
    </div>
  );
}
