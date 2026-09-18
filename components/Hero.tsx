const codeSnippet = `<span class="code-purple">const</span> developer = {
  name: <span class="code-green">&quot;Mario Flores&quot;</span>,
  role: <span class="code-green">&quot;Full-stack developer&quot;</span>,
  backend: [<span class="code-green">&quot;Python&quot;</span>, <span class="code-green">&quot;Django&quot;</span>],
  frontend: [<span class="code-green">&quot;Vue&quot;</span>, <span class="code-green">&quot;JavaScript&quot;</span>],
  focus: <span class="code-green">&quot;Practical solutions&quot;</span>
};`;

export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <p className="eyebrow">DESARROLLADOR WEB FULL-STACK</p>

          <h1>
            Construyo aplicaciones web
            <span>funcionales y modernas.</span>
          </h1>

          <p className="hero-description">
            Desarrollo soluciones completas combinando backend, frontend,
            bases de datos y despliegue.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#proyectos">
              Ver proyectos
            </a>

            <a
              className="button button-secondary"
              href="https://github.com/Mfloresr"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver GitHub
            </a>
          </div>
        </div>

        <div className="hero-card">
          <div className="terminal-top">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <pre>
            <code dangerouslySetInnerHTML={{ __html: codeSnippet }} />
          </pre>
        </div>
      </div>
    </section>
  );
}
