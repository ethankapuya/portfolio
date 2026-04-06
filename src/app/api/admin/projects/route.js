import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { rows } = await sql`
    SELECT * FROM projects
    ORDER BY sort_order ASC, created_at DESC
  `;
  return Response.json(rows);
}
