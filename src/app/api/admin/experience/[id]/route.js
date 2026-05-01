import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  const body = await request.json();
  const { title, tags, description, period, sort_order } = body;

  if (tags != null && !Array.isArray(tags)) {
    return Response.json({ error: "tags must be an array" }, { status: 400 });
  }

  const { rows } = await sql`
    UPDATE experiences SET
      title = COALESCE(${title ?? null}, title),
      tags = COALESCE(${tags ?? null}, tags),
      description = COALESCE(${description ?? null}, description),
      period = COALESCE(${period || null}, period),
      sort_order = COALESCE(${sort_order ?? null}, sort_order),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING id, title, tags, description, period, sort_order
  `;

  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(rows[0]);
}

export async function DELETE(_request, { params }) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { id } = await params;
  const { rowCount } = await sql`DELETE FROM experiences WHERE id = ${id}`;
  if (rowCount === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ success: true });
}
