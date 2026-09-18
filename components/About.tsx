"use client";

import { useReveal } from "@/lib/useReveal";

export default function About() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="sobre-mi" className="section reveal" ref={ref}>
      <div className="container section-grid">
        <div>
          <p className="section-label">01 — SOBRE MÍ</p>
          <h2>Experiencia práctica y visión full-stack.</h2>
        </div>

        <div className="section-content">
          <p>
            Soy desarrollador web full-stack con experiencia práctica en el
            desarrollo de aplicaciones completas.
          </p>

          <p>
            Trabajo en la lógica de negocio, el desarrollo de APIs, la
            creación de interfaces web, la gestión de bases de datos y el
            despliegue de aplicaciones.
          </p>

          <p>
            Actualmente practico con nuevas tecnologías para ampliar mi
            stack y mejorar la calidad y mantenibilidad de mis proyectos.
          </p>
        </div>
      </div>
    </section>
  );
}
