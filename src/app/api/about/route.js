import { getAbout } from "@/lib/about";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getAbout();
  return Response.json(content);
}
