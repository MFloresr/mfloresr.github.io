import Pendiente from "./Pendiente";

/** Página del esqueleto: título real de la sección y el contenido marcado como pendiente. */
export default function PaginaProvisional({ titulo, pendiente }: { titulo: string; pendiente: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{titulo}</h1>
      <Pendiente>{pendiente}</Pendiente>
    </div>
  );
}
