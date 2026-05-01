import { getContact } from "@/lib/contact";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getContact());
}
