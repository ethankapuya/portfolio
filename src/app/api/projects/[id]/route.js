import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const { title, description, tags, github_url, website_url, demo_url, year, last_commit_sha, is_published, sort_order } = body;

  // Snapshot current state before updating
  await sql`
    INSERT INTO project_history (project_id, title, description, tags, github_url, website_url, demo_url, year, last_commit_sha)
    SELECT id, title, description, tags, github_url, website_url, demo_url, year, last_commit_sha
    FROM projects WHERE id = ${id}
  `;

  const { rows } = await sql`
    UPDATE projects SET
      title = COALESCE(${title ?? null}, title),
      description = COALESCE(${description ?? null}, description),
      tags = COALESCE(${tags ?? null}, tags),
      github_url = COALESCE(${github_url ?? null}, github_url),
      website_url = COALESCE(${website_url || null}, website_url),
      demo_url = COALESCE(${demo_url || null}, demo_url),
      year = COALESCE(${year ?? null}, year),
      last_commit_sha = COALESCE(${last_commit_sha ?? null}, last_commit_sha),
      is_published = COALESCE(${is_published ?? null}, is_published),
      sort_order = COALESCE(${sort_order ?? null}, sort_order),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;

  if (rows.length === 0) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  return Response.json(rows[0]);
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;

  // Snapshot before deleting
  await sql`
    INSERT INTO project_history (project_id, title, description, tags, github_url, website_url, demo_url, year, last_commit_sha)
    SELECT id, title, description, tags, github_url, website_url, demo_url, year, last_commit_sha
    FROM projects WHERE id = ${id}
  `;

  const { rowCount } = await sql`DELETE FROM projects WHERE id = ${id}`;

  if (rowCount === 0) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  return Response.json({ success: true });
}
