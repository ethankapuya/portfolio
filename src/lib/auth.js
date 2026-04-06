import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";

export function verifyPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (password.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(password),
    Buffer.from(expected)
  );
}

export function createSessionToken() {
  const secret = process.env.AUTH_SECRET;
  const payload = JSON.stringify({
    admin: true,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${sig}`;
}

export function verifySessionToken(token) {
  try {
    const secret = process.env.AUTH_SECRET;
    const [encoded, sig] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(encoded)
      .digest("base64url");
    if (sig !== expectedSig) return false;
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (payload.exp < Date.now()) return false;
    return payload.admin === true;
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !verifySessionToken(token)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null; // authorized
}

export { COOKIE_NAME };
