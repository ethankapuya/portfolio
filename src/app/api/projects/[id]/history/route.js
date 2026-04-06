import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request, { params }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { id } = await params;
  const { rows } = await sql`
    SELECT * FROM project_history
    WHERE project_id = ${id}
    ORDER BY saved_at DESC
  `;

  return Response.json(rows);
}
