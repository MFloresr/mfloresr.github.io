"use client";

import { useReveal } from "@/lib/useReveal";

export default function Contact() {
  const sectionRef = useReveal<HTMLElement>();
  const boxRef = useReveal<HTMLDivElement>();

  return (
    <section id="contacto" className="section contact-section reveal" ref={sectionRef}>
      <div className="container contact-box reveal" ref={boxRef}>
        <p className="section-label">04 — CONTACTO</p>
        <h2>¿Hablamos?</h2>

        <p>
          Puedes encontrar mis proyectos y conocer más sobre mi trabajo en
          GitHub.
        </p>

        <div className="hero-actions">
          <a
            className="button button-primary"
            href="https://github.com/Mfloresr"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>

          <a className="button button-secondary" href="mailto:tu-correo@example.com">
            Enviar email
          </a>
        </div>
      </div>
    </section>
  );
}
