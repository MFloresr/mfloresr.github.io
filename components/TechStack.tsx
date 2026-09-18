"use client";

import { useReveal } from "@/lib/useReveal";
import { techStack } from "@/lib/data";

function TechCard({
  icon,
  name,
  description,
}: {
  icon: string;
  name: string;
  description: string;
}) {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div className="tech-card reveal" ref={ref}>
      <span className="tech-icon">{icon}</span>
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function TechStack() {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="tecnologias" className="section section-alt reveal" ref={ref}>
      <div className="container">
        <p className="section-label">02 — TECNOLOGÍAS</p>
        <h2>Herramientas con las que trabajo.</h2>

        <div className="tech-grid">
          {techStack.map((tech) => (
            <TechCard key={tech.name} {...tech} />
          ))}
        </div>
      </div>
    </section>
  );
}
