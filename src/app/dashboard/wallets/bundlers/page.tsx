"use client";

import { useEffect, useState } from "react";
import Card from "@/components/card/Card";
import { Copy, Trash2, ExternalLink, Key } from "lucide-react";

export default function WalletsBundlersPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);

  // Modale
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // State dla generate
  const [bundlersCount, setBundlersCount] = useState(1);

  // State dla receive all
  const [receiveAddress, setReceiveAddress] = useState("");

  // Pobranie sesji
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      }
    })();
  }, []);

  async function refresh() {
    if (!user?.phantomWallet) return;
    const res = await fetch(`/api/wallets?userWallet=${user.phantomWallet}`);
    const data = await res.json();
    setWallets(data);
  }

  useEffect(() => {
    refresh();
  }, [user]);

  async function handleGenerate() {
    if (!user?.phantomWallet) return alert("User not logged in");
    if (bundlersCount <= 0) return alert("Enter valid number");

    try {
      const res = await fetch("/api/wallets/generate-bundlers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: user.phantomWallet,
          count: bundlersCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate bundlers");

      setBundlersCount(1);
      setShowGenerateModal(false);
      await refresh();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDispense() {
    if (!user?.phantomWallet) return alert("User not logged in");

    try {
      const res = await fetch("/api/wallets/dispense-bundlers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: user.phantomWallet,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispense SOL");

      alert("SOL dispensed to all bundlers!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleReceiveAll() {
    if (!user?.phantomWallet) return alert("User not logged in");
    if (!receiveAddress.trim()) return alert("Enter valid address");

    try {
      const res = await fetch("/api/wallets/receive-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: user.phantomWallet,
          targetAddress: receiveAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to transfer SOL");

      setReceiveAddress("");
      setShowReceiveModal(false);
      alert("Funds received from all bundlers!");
    } catch (err: any) {
      alert(err.message);
    }
  }

  const filtered = wallets
    .filter((w) => w.category === "BUNDLERS")
    .filter(
      (w) =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.publicKey.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="flex flex-col gap-6 text-gray-200">
      <Card title="Bundlers">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search by name or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#141322] border border-white/10 text-sm text-white w-64 focus:outline-none focus:ring-1 focus:ring-[#432161]"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="px-3 py-1 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700"
            >
              Generate Bundlers
            </button>
            <button
              onClick={handleDispense}
              className="px-3 py-1 text-sm rounded-md bg-green-600 hover:bg-green-700"
            >
              Dispense SOL
            </button>
            <button
              onClick={() => setShowReceiveModal(true)}
              className="px-3 py-1 text-sm rounded-md bg-yellow-600 hover:bg-yellow-700"
            >
              Receive All
            </button>
          </div>
        </div>

{/* Table Header */}
<div className="grid grid-cols-3 text-sm font-medium text-gray-400 border-b border-white/10 pb-2 mb-2">
  <div>Wallet</div>
  <div className="text-right">Balance</div>
  <div className="text-right">Actions</div>
</div>

{/* Table Rows */}
<div className="flex flex-col gap-2">
  {filtered.map((w) => (
    <div
      key={w.publicKey}
      className="group grid grid-cols-3 items-center text-sm py-2 px-2 rounded-md hover:bg-[#1a1929] transition"
    >
      {/* Wallet name + publicKey */}
      <div>
        <div className="font-medium text-white">{w.name}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
          {w.publicKey}
          {/* Copy button */}
          <div className="relative group/copy">
            <button
              onClick={() => navigator.clipboard.writeText(w.publicKey)}
              className="opacity-70 hover:opacity-100"
            >
              <Copy size={14} />
            </button>
            {/* Tooltip */}
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 
                             text-xs text-white bg-black rounded whitespace-nowrap 
                             opacity-0 group-hover/copy:opacity-100 transition 
                             pointer-events-none z-50">
              Copy address
            </span>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="text-right font-semibold text-white">
        ◎ {w.balance ?? 0}
      </div>

      {/* Actions - widoczne tylko po hoverze */}
      <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition">
        {/* Remove */}
        <div className="relative group/remove">
          <button
            onClick={() => console.log("Remove", w.publicKey)}
            className="text-red-500 hover:text-red-400"
          >
            <Trash2 size={18} />
          </button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 
                           text-xs text-white bg-black rounded whitespace-nowrap 
                           opacity-0 group-hover/remove:opacity-100 transition 
                           pointer-events-none z-50">
            Remove
          </span>
        </div>

        {/* Open in Solscan */}
        <div className="relative group/solscan">
          <a
            href={`https://solscan.io/account/${w.publicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            <ExternalLink size={18} />
          </a>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 
                           text-xs text-white bg-black rounded whitespace-nowrap 
                           opacity-0 group-hover/solscan:opacity-100 transition 
                           pointer-events-none z-50">
            Open in Solscan
          </span>
        </div>

        {/* Export Private Key */}
        <div className="relative group/export">
          <button
            onClick={() => console.log("Export private key", w.publicKey)}
            className="text-yellow-400 hover:text-yellow-300"
          >
            <Key size={18} />
          </button>
          <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 
                           text-xs text-white bg-black rounded whitespace-nowrap 
                           opacity-0 group-hover/export:opacity-100 transition 
                           pointer-events-none z-50">
            Export private key
          </span>
        </div>
      </div>
    </div>
  ))}
</div>


      </Card>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1929] p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4 text-white">Generate Bundlers</h2>
            <input
              type="number"
              min={1}
              value={bundlersCount}
              onChange={(e) => setBundlersCount(Number(e.target.value))}
              className="w-full px-3 py-2 mb-4 rounded-md bg-[#141322] border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="px-3 py-1 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive All Modal */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1929] p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4 text-white">Receive All</h2>
            <input
              type="text"
              placeholder="Target Solana address"
              value={receiveAddress}
              onChange={(e) => setReceiveAddress(e.target.value)}
              className="w-full px-3 py-2 mb-4 rounded-md bg-[#141322] border border-white/10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReceiveModal(false)}
                className="px-3 py-1 text-sm rounded-md bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReceiveAll}
                className="px-3 py-1 text-sm rounded-md bg-yellow-600 hover:bg-yellow-700"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
