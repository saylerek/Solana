"use client";

import io from "socket.io-client";
import { useState, useEffect, useMemo } from "react";
import Card from "@/components/card/Card";

const LAMPORTS_PER_SOL = 1_000_000_000;

const socket = io("http://localhost:4000", {
  auth: { wallet: "frontend-user" }, // identyfikacja klienta
});

interface Wallet {
  publicKey: string;
  privateKey: string;
  name: string;
  category: "DEV" | "MAIN" | "BUNDLERS" | "CUSTOM";
}

// Typ użytkownika
interface User {
  phantomWallet?: string;
  name?: string;
  // tu możesz dodać inne pola z API
}

// Typ logów mixera
interface MixerLogMessage {
  message: string;
}

// Typ dla zakończenia miksowania
interface MixCompleteMessage {
  success: boolean;
}

export default function MixerPage() {
  const [numWallets, setNumWallets] = useState(3);
  const [finalWallet, setFinalWallet] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [isMixing, setIsMixing] = useState(false);

  // nowy stan do wyboru startowego portfela
  const [walletCategory, setWalletCategory] = useState<"DEV" | "MAIN" | "BUNDLERS" | "CUSTOM">("DEV");
  const [availableWallets, setAvailableWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [customSecret, setCustomSecret] = useState("");

  const [currentStep, setCurrentStep] = useState(0);

  // pobieranie usera i portfeli
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.user);
      }
    })();
  }, []);

  useEffect(() => {
    async function fetchWallets() {
      if (!user?.phantomWallet) return;
      const res = await fetch(`/api/wallets?userWallet=${user.phantomWallet}`);
      const data = await res.json();
      // filtrujemy portfele wg kategorii
      const filtered = (data as Wallet[]).filter((w) => w.category === walletCategory);
      setAvailableWallets(filtered);
      if (filtered.length > 0) setSelectedWallet(filtered[0].publicKey);
    }
    if (walletCategory !== "CUSTOM") {
      fetchWallets();
    }
  }, [user, walletCategory]);

  // nasłuch logów
  useEffect(() => {
  const handleLog = (msg: MixerLogMessage) => {
  setLogs((prev) => [...prev, msg.message]);
  const match = msg.message.match(/step (\d+)\/(\d+)/);
  if (match) {
    setCurrentStep(Number(match[1]));
  }
};

const handleComplete = (msg: MixCompleteMessage) => {
  const { success } = msg;
  setIsMixing(false);
  setCurrentStep(0);
  setLogs((prev) => [...prev, success ? "✅ Mix complete" : "❌ Mix failed"]);
};

  socket.on("mixer-log", handleLog);
  socket.on("mix-complete", handleComplete);

  return () => {
    socket.off("mixer-log", handleLog);
    socket.off("mix-complete", handleComplete);
  };
}, []);

  const handleStartMix = () => {
    if (!finalWallet) {
      setLogs(["❌ Please enter final wallet"]);
      return;
    }

    let senderSecret = "";
    if (walletCategory === "CUSTOM") {
      if (!customSecret.trim()) {
        setLogs(["❌ Please enter private key"]);
        return;
      }
      senderSecret = customSecret.trim();
    } else {
      // tu zakładam że API zwraca privateKey (trzeba to obsłużyć w backendzie!)
      const wallet = availableWallets.find((w) => w.publicKey === selectedWallet);
      if (!wallet) {
        setLogs(["❌ No wallet selected"]);
        return;
      }
      senderSecret = wallet.privateKey; 
    }

    setLogs([]);
    setIsMixing(true);

    socket.emit("start-mix", {
      senderSecret,
      finalWallet,
      numWallets,
    });
  };

  const clearLogs = () => setLogs([]);

  const estimatedCostSOL = useMemo(() => {
    const lamportsStart = 4985000;
    const lamportsEnd = 4935000;
    const numHops = numWallets;
    if (numHops <= 0) return 0;
    const perHopFee = (lamportsStart - lamportsEnd) / 10;
    const totalLamports = perHopFee * numHops;
    return totalLamports / LAMPORTS_PER_SOL;
  }, [numWallets]);

  return (
    <div className="text-gray-300 flex flex-col gap-6">
      <h2 className="text-lg font-bold mb-4">Mixer</h2>

      <Card title="Mixer">
        <div className="flex flex-col gap-4">
          {/* wybór kategorii portfela */}
          <div>
            <label className="text-sm">Start wallet category</label>
            <select
              value={walletCategory}
              onChange={(e) => setWalletCategory(e.target.value as "DEV" | "MAIN" | "BUNDLERS" | "CUSTOM")}
              className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white"
            >
              <option value="DEV">DEV</option>
              <option value="MAIN">MAIN</option>
              <option value="BUNDLERS">BUNDLERS</option>
              <option value="CUSTOM">Custom (Private Key)</option>
            </select>
          </div>

          {/* w zależności od wyboru */}
          {walletCategory === "CUSTOM" ? (
            <div>
              <label className="text-sm">Private Key</label>
              <input
                type="text"
                value={customSecret}
                onChange={(e) => setCustomSecret(e.target.value)}
                placeholder="Enter base58 private key"
                className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm">Choose wallet</label>
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
                className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white"
              >
                {availableWallets.map((w) => (
                  <option key={w.publicKey} value={w.publicKey}>
                    {w.name} ({w.publicKey.slice(0, 4)}...{w.publicKey.slice(-4)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* final wallet */}
          <div>
            <label className="text-sm">Final Wallet</label>
            <input
              type="text"
              value={finalWallet}
              onChange={(e) => setFinalWallet(e.target.value)}
              placeholder="Paste wallet address"
              className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white"
            />
          </div>

          {/* ile hopów */}
          <div>
            <label className="text-sm">Intermediate wallets</label>
            <input
              type="number"
              min={2}
              value={numWallets}
              onChange={(e) => setNumWallets(Number(e.target.value))}
              className="w-24 rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white"
            />
          </div>

<div className="text-center text-sm text-gray-400">
  Progress: {currentStep}/{numWallets} hops ({((currentStep / numWallets) * 100).toFixed(0)}%)
</div>
          <div className="text-center text-sm text-gray-400">
            Estimated transfer cost: {estimatedCostSOL.toFixed(6)} SOL
          </div>

          <button
            onClick={handleStartMix}
            disabled={isMixing}
            className="px-4 py-2 mt-2 rounded-md bg-[#1a1929] border border-white/10 text-sm font-medium text-white hover:bg-[#2d215a] transition disabled:opacity-50"
          >
            {isMixing ? "Mixing..." : "Start"}
          </button>
        </div>
      </Card>

      {/* logi */}
      <Card title="Logs">
        <div className="h-64 overflow-y-auto font-mono text-sm rounded-md border border-white/10 bg-gradient-to-b from-[#141322] to-[#0d0c1b] p-3">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No transfers...</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-gray-200">{log}</div>
            ))
          )}
        </div>
        <button
          onClick={clearLogs}
          className="mt-2 px-3 py-1 rounded-md bg-[#1a1929] border border-white/10 text-sm text-gray-300 hover:bg-[#242235] transition"
        >
          Clear Logs
        </button>
      </Card>
    </div>
  );
}
