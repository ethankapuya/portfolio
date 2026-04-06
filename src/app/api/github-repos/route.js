import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  // Fetch all public repos from GitHub
  const ghHeaders = { Accept: "application/vnd.github.v3+json" };
  if (process.env.GITHUB_TOKEN) {
    ghHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const repos = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `https://api.github.com/users/ethankapuya/repos?per_page=100&page=${page}&sort=updated`,
      { headers: ghHeaders }
    );
    if (!res.ok) break;
    const batch = await res.json();
    if (batch.length === 0) break;
    repos.push(...batch);
    page++;
  }

  // Fetch all projects from DB
  const { rows: dbProjects } = await sql`SELECT * FROM projects`;

  // Build a map of github_url -> db project
  const dbMap = {};
  for (const p of dbProjects) {
    dbMap[p.github_url.toLowerCase()] = p;
  }

  // Merge: every GitHub repo, enriched with DB status
  const merged = repos.map((repo) => {
    const dbProject = dbMap[repo.html_url.toLowerCase()];
    return {
      github_url: repo.html_url,
      repo_name: repo.name,
      repo_description: repo.description,
      latest_commit_sha: repo.sha || null,
      // DB fields (null if not tracked)
      db_id: dbProject?.id || null,
      title: dbProject?.title || null,
      description: dbProject?.description || null,
      tags: dbProject?.tags || null,
      website_url: dbProject?.website_url || null,
      demo_url: dbProject?.demo_url || null,
      year: dbProject?.year || null,
      is_published: dbProject?.is_published || false,
      last_commit_sha: dbProject?.last_commit_sha || null,
      sort_order: dbProject?.sort_order || 0,
      updated_at: dbProject?.updated_at || null,
    };
  });

  return Response.json(merged);
}
