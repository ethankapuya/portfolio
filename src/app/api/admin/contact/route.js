import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { CONTACT_FIELDS, getContact } from "@/lib/contact";

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;
  return Response.json(await getContact());
}

export async function PUT(request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const body = await request.json();
  const next = {};
  for (const key of CONTACT_FIELDS) {
    if (typeof body[key] !== "string") {
      return Response.json(
        { error: `Field "${key}" must be a string` },
        { status: 400 }
      );
    }
    next[key] = body[key];
  }

  const json = JSON.stringify(next);
  await sql`
    INSERT INTO site_content (key, content, updated_at)
    VALUES ('contact', ${json}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE
      SET content = EXCLUDED.content,
          updated_at = NOW()
  `;

  return Response.json({ success: true, content: next });
}
