import { verifyPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request) {
  const { password } = await request.json();

  if (!password || !verifyPassword(password)) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return Response.json({ success: true });
}
