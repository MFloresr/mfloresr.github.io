"use client";

import { useReveal } from "@/lib/useReveal";
import { featuredProject, githubProfileUrl } from "@/lib/data";
import type { Repo } from "@/lib/github";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function FeaturedProjectCard({ stats }: { stats: Repo | null }) {
  const ref = useReveal<HTMLElement>();

  return (
    <article className="project-card reveal" ref={ref}>
      <div className="project-content">
        <p className="project-number">{featuredProject.number}</p>
        <h3>{featuredProject.title}</h3>
        <p>{featuredProject.description}</p>

        <div className="project-tags">
          {featuredProject.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        <a
          className="text-link"
          href={`${githubProfileUrl}/${featuredProject.repo}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver repositorio →
        </a>

        {stats && (
          <p className="project-meta">
            ⭐ {stats.stargazers_count} · actualizado el {formatDate(stats.pushed_at)}
          </p>
        )}
      </div>

      <div className="project-preview">
        <div className="preview-window">
          <div className="preview-header">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="preview-body">
            <div className="preview-line large"></div>
            <div className="preview-line"></div>
            <div className="preview-line short"></div>

            <div className="preview-stats">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function RecentRepoCard({ repo }: { repo: Repo }) {
  return (
    <a
      className="repo-card"
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h4>{repo.name}</h4>
      {repo.description && <p>{repo.description}</p>}
      <div className="repo-meta">
        <span>{repo.language ?? "—"}</span>
        <span>{formatDate(repo.pushed_at)}</span>
      </div>
    </a>
  );
}

export default function Projects({
  featuredRepo,
  recentRepos,
}: {
  featuredRepo: Repo | null;
  recentRepos: Repo[];
}) {
  const ref = useReveal<HTMLElement>();

  return (
    <section id="proyectos" className="section reveal" ref={ref}>
      <div className="container">
        <p className="section-label">03 — PROYECTOS</p>
        <h2>Proyectos destacados.</h2>

        <FeaturedProjectCard stats={featuredRepo} />

        {recentRepos.length > 0 && (
          <div className="repo-list">
            <p className="repo-list-label">Otros repositorios recientes en GitHub</p>
            <div className="repo-grid">
              {recentRepos.map((repo) => (
                <RecentRepoCard key={repo.name} repo={repo} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
