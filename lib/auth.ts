export const SESSION_COOKIE = "admin_session";

// Demo-grade auth: the session cookie is a hash of the shared admin password.
// Uses Web Crypto so it runs in both the Node runtime and the proxy (edge).
export async function sessionToken(): Promise<string> {
  const data = new TextEncoder().encode(`digsite:${process.env.ADMIN_PASSWORD}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
