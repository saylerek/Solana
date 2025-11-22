// phantomClient.ts (client-only)
export async function requestNonce() {
  const r = await fetch("/api/auth/challenge", { method: "POST" });
  if (!r.ok) throw new Error("Failed to get challenge");
  return r.json(); // { nonce: string }
}

export async function signAndLoginWithPhantom() {
  const provider = (window as any).solana;
  if (!provider?.isPhantom) throw new Error("No Phantom wallet");

  // 1) pobierz nonce
  const { nonce } = await requestNonce();

  // 2) connect (jeśli niepołączony)
  const resp = await provider.connect();
  const publicKey = resp.publicKey.toString();

  // 3) podpisz nonce
  const encoded = new TextEncoder().encode(nonce);
  const signed = await provider.signMessage(encoded, "utf8");

  // signed.signature jest Uint8Array -> wyślij jako tablica liczb
  const apiResp = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phantomWallet: publicKey,
      signature: Array.from(signed.signature),
      nonce,
    }),
  });

  if (!apiResp.ok) {
    const err = await apiResp.json();
    throw new Error(err?.error || "Signin failed");
  }
  return apiResp.json(); // powinno zwrócić dane sesji/ user (bez secretKey)
}
