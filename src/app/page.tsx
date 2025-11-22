"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signAndLoginWithPhantom } from "@/lib/phantomClient";

declare global {
  interface Window {
    solana?: any;
  }
}

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // sprawdzamy czy użytkownik już jest zalogowany (sesja w cookies)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me");
        if (r.ok) {
          const json = await r.json();
          setUser(json.user);
          router.push("/dashboard");
        }
      } catch (e) {
        console.error("Błąd pobierania usera", e);
      }
    })();
  }, []);

  const connectPhantom = async () => {
    setLoading(true);
    try {
      // login z podpisem
      const res = await signAndLoginWithPhantom();
      setUser(res.user);

      console.log("Zalogowany portfel:", res.user.phantomWallet);

      // przekierowanie po zalogowaniu
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <button
          onClick={connectPhantom}
          disabled={loading}
          className="px-6 py-3 rounded-md bg-purple-600 text-white"
        >
          {loading ? "Logging..." : "Log in with Phantom"}
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Welcome, {user.phantomWallet}</h1>
      <p>Balance: {user.balance}</p>
      <p>Role: {user.role}</p>
    </main>
  );
}
