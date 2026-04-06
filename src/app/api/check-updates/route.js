import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function parseGithubUrl(url) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { projectId } = body;

  let projects;
  if (projectId) {
    const result = await sql`SELECT id, title, github_url, last_commit_sha FROM projects WHERE id = ${projectId}`;
    projects = result.rows;
  } else {
    const result = await sql`SELECT id, title, github_url, last_commit_sha FROM projects ORDER BY sort_order ASC`;
    projects = result.rows;
  }

  const results = await Promise.all(
    projects.map(async (project) => {
      const parsed = parseGithubUrl(project.github_url);
      if (!parsed) {
        return { id: project.id, title: project.title, error: "Invalid GitHub URL" };
      }

      try {
        const res = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits?per_page=1`,
          { headers: {
            Accept: "application/vnd.github.v3+json",
            ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
          } }
        );
        if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
        const commits = await res.json();
        const latestSha = commits[0]?.sha || null;

        return {
          id: project.id,
          title: project.title,
          hasUpdates: latestSha !== project.last_commit_sha,
          currentSha: project.last_commit_sha,
          latestSha,
        };
      } catch (err) {
        return { id: project.id, title: project.title, error: err.message };
      }
    })
  );

  return Response.json(results);
}
