import { sql } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`
    SELECT content, mime, updated_at FROM site_assets WHERE key = 'resume'
  `;

  if (rows.length > 0) {
    const row = rows[0];
    const buf = Buffer.isBuffer(row.content)
      ? row.content
      : Buffer.from(row.content);
    return new Response(buf, {
      headers: {
        "Content-Type": row.mime || "application/pdf",
        "Cache-Control": "no-store",
        "Last-Modified": new Date(row.updated_at).toUTCString(),
      },
    });
  }

  const fallback = await readFile(
    path.join(process.cwd(), "public", "resume.pdf")
  );
  return new Response(fallback, {
    headers: {
      "Content-Type": "application/pdf",
      "Cache-Control": "no-store",
    },
  });
}
