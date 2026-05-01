import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { rows } = await sql`
    SELECT id, title, tags, description, period, sort_order
    FROM experiences
    ORDER BY sort_order ASC, id ASC
  `;
  return Response.json(rows);
}

export async function POST(request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await request.json();
  const err = validate(body);
  if (err) return Response.json({ error: err }, { status: 400 });

  const { rows: maxRows } = await sql`
    SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM experiences
  `;
  const nextOrder = Number(maxRows[0].max_order) + 1;

  const { rows } = await sql`
    INSERT INTO experiences (title, tags, description, period, sort_order)
    VALUES (${body.title}, ${body.tags}, ${body.description}, ${body.period || null}, ${nextOrder})
    RETURNING id, title, tags, description, period, sort_order
  `;
  return Response.json(rows[0]);
}

function validate(body) {
  if (!body.title || typeof body.title !== "string") return "title is required";
  if (!body.description || typeof body.description !== "string")
    return "description is required";
  if (!Array.isArray(body.tags)) return "tags must be an array";
  if (body.tags.some((t) => typeof t !== "string"))
    return "tags must be strings";
  if (body.period != null && typeof body.period !== "string")
    return "period must be a string";
  return null;
}
