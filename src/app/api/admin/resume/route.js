import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const form = await request.formData();
  const file = form.get("file");

  if (!file || typeof file === "string") {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "File must be a PDF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "File exceeds 10 MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const hex = buf.toString("hex");

  await sql`
    INSERT INTO site_assets (key, content, mime, updated_at)
    VALUES ('resume', decode(${hex}, 'hex'), 'application/pdf', NOW())
    ON CONFLICT (key) DO UPDATE
      SET content = decode(${hex}, 'hex'),
          mime = 'application/pdf',
          updated_at = NOW()
  `;

  return Response.json({ success: true, size: buf.length });
}

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  const { rows } = await sql`
    SELECT octet_length(content) AS size, updated_at
    FROM site_assets WHERE key = 'resume'
  `;
  if (rows.length === 0) {
    return Response.json({ exists: false });
  }
  return Response.json({
    exists: true,
    size: Number(rows[0].size),
    updated_at: rows[0].updated_at,
  });
}
