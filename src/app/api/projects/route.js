import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { rows } = await sql`
    SELECT id, title, description, tags, github_url, website_url, demo_url, year
    FROM projects
    WHERE is_published = true
    ORDER BY sort_order ASC, created_at DESC
  `;
  return Response.json(rows);
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { title, description, tags, github_url, website_url, demo_url, year, last_commit_sha } = body;

  const { rows } = await sql`
    INSERT INTO projects (title, description, tags, github_url, website_url, demo_url, year, last_commit_sha)
    VALUES (${title}, ${description}, ${tags}, ${github_url}, ${website_url || null}, ${demo_url || null}, ${year}, ${last_commit_sha || null})
    RETURNING *
  `;

  return Response.json(rows[0], { status: 201 });
}
