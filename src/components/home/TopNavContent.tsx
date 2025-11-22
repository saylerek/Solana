"use client";

import Link from "next/link";
import { Connection, PublicKey } from "@solana/web3.js";
import { usePathname, useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { logout } from "@/lib/authClient";

const links = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/create-token", label: "Create Token" },
  { href: "/dashboard/meta", label: "Meta" },
  { href: "/dashboard/tools/solana-flow", label: "Tools" },
  { href: "/dashboard/twitter-tracker", label: "Twitter Tracker" },
  { href: "/dashboard/wallets/main", label: "Wallets" },
  { href: "/dashboard/rewards", label: "Rewards" },
];

export default function TopNavContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handleLogout = async () => {
    const ok = await logout();
    if (ok) {
      router.replace("/"); 
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.replace("/");
        return;
      }
      const json = await res.json();
      if (!json.user?.phantomWallet) {
        router.replace("/");
        return;
      }

      const address = json.user.phantomWallet;
      setWalletAddress(address);

      try {
          const url = 'https://solana-mainnet.api.syndica.io/api-key/2M4yaaFViiAgXXUNZS4WTHvPMTkbL3NLCGrexTjzqpfzmMd3Msxf6BiFrn86iMjwUtjgjbSHqJtFzDyW7BE3J2mwio1ZVddShHU';
        const connection = new Connection(url, "confirmed");
        const lamports = await connection.getBalance(new PublicKey(address));
        setSolBalance(lamports / 1e9);
      } catch (err) {
        console.error("Failed to get balance:", err);
        setSolBalance(0);
      }
    };

    fetchSession();
  }, [router]);

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#0b0a16]/60 backdrop-blur-sm">
      <Link
        href="/dashboard/"
        className="text-xl font-bold cursor-pointer bg-gradient-to-r from-purple-400 via-pink-500 to-gray-400 bg-clip-text text-transparent transition-all duration-500 hover:animate-gradient"
      >
        NovaLaunch
      </Link>

      <div className="flex items-center gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm px-3 py-1 rounded-md transition ${
              pathname === link.href
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700/40"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-300 text-sm">
          {solBalance !== null ? solBalance.toFixed(2) : "--"} SOL
        </span>

        <button className="p-2 rounded-full hover:bg-gray-700/40 transition">
          <Settings className="w-5 h-5 text-gray-300" />
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-gray-700/40 transition relative group flex flex-col items-center"
        >
          <LogOut className="w-5 h-5 text-red-300" />
          <span className="absolute top-full mt-1 scale-0 group-hover:scale-100 transition-all bg-gray-800 text-red-500 text-xs px-2 py-1 rounded-md whitespace-nowrap">
            Log Out
          </span>
        </button>
      </div>
    </nav>
  );
}
