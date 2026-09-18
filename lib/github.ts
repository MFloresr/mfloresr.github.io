export type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  pushed_at: string;
  stargazers_count: number;
};

type ApiRepo = Repo & { fork: boolean; archived: boolean };

const GITHUB_USER = "MFloresr";
const GITHUB_HEADERS = { Accept: "application/vnd.github+json" };
const REVALIDATE_SECONDS = 3600;

export async function getFeaturedRepo(name: string): Promise<Repo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${name}`, {
      headers: GITHUB_HEADERS,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return (await res.json()) as Repo;
  } catch {
    return null;
  }
}

export async function getRecentRepos(exclude: string[], limit = 4): Promise<Repo[]> {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
      { headers: GITHUB_HEADERS, next: { revalidate: REVALIDATE_SECONDS } }
    );
    if (!res.ok) return [];
    const repos = (await res.json()) as ApiRepo[];
    return repos
      .filter((r) => !r.fork && !r.archived && !exclude.includes(r.name))
      .slice(0, limit);
  } catch {
    return [];
  }
}
