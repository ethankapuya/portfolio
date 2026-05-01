import { sql } from "@/lib/db";

export const CONTACT_DEFAULTS = {
  body:
    "E-mail me at ethankapuya@gmail.com or reach out using the social platforms above.",
};

export const CONTACT_FIELDS = ["body"];

export async function getContact() {
  const { rows } = await sql`
    SELECT content FROM site_content WHERE key = 'contact'
  `;
  const stored = rows[0]?.content || {};
  return { ...CONTACT_DEFAULTS, ...stored };
}
