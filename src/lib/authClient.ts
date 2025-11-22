// src/lib/authClient.ts
export async function getClientSession() {
  try {
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        : "";

    const res = await fetch(`${baseUrl}/api/auth/me`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.user ?? null;
  } catch (err) {
    console.error("getClientSession error:", err);
    return null;
  }
}

export async function logout() {
  try {
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        : "";

    const res = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
    return res.ok;
  } catch (err) {
    console.error("logout error:", err);
    return false;
  }
}
