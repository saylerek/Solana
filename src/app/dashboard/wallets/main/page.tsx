"use client";

import { useEffect, useState, useCallback } from "react";
import Card from "@/components/card/Card";

interface Wallet {
  publicKey: string;
  privateKey?: string;
  name: string;
  category: "DEV" | "MAIN" | "BUNDLERS" | "CUSTOM";
  balance?: number;
}

interface User {
  phantomWallet?: string;
  name?: string;
}


export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<User | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [walletCategory, setWalletCategory] = useState("MAIN");

  // Pobranie sesji (Phantom login)
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      }
    })();
  }, []);

const refresh = useCallback(async () => {
  if (!user?.phantomWallet) return;
  const res = await fetch(`/api/wallets?userWallet=${user.phantomWallet}`);
  const data = await res.json();
  setWallets(data);
}, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate() {
    if (!user?.phantomWallet) return alert("User not logged in");
    if (!walletName.trim()) return alert("Enter wallet name");

    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: user.phantomWallet,
          name: walletName,
          category: walletCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create wallet");

      setWalletName("");
      setWalletCategory("MAIN");
      setShowModal(false);
      await refresh();
} catch (err: unknown) {
  if (err instanceof Error) alert(err.message);
  else alert("Unknown error");
}
  }

const filtered = wallets
  .filter((w) => w.category === "MAIN")
  .filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.publicKey.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="flex flex-col gap-6 text-gray-200">
      <Card title="Wallets">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search by name or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#141322] border border-white/10 text-sm text-white w-64 focus:outline-none focus:ring-1 focus:ring-[#432161]"
          />

          <div className="flex gap-5">
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700"
            >
              Create Wallet
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="grid grid-cols-3 text-sm font-medium text-gray-400 border-b border-white/10 pb-2 mb-2">
          <div>Name</div>
          <div>Category</div>
          <div className="text-right">Public Key</div>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.map((w) => (
            <div
              key={w.publicKey}
              className="grid grid-cols-3 items-center text-sm py-2 px-2 rounded-md hover:bg-[#1a1929] transition"
            >
              <div>{w.name}</div>
              <div className="text-gray-400">{w.category}</div>
              <div className="font-mono text-gray-400 text-right">
                {w.publicKey}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1929] p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4 text-white">Create Wallet</h2>

            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="Wallet name"
              className="w-full px-3 py-2 mb-4 rounded-md bg-[#141322] border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-3 py-1 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
