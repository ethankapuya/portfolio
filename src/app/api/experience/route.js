import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT id, title, tags, description, period, sort_order
    FROM experiences
    ORDER BY sort_order ASC, id ASC
  `;
  return Response.json(rows);
}
