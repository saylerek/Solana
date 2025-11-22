"use client";

import { useState } from "react";
import Card from "@/components/card/Card"; // <- zakładam że Card.tsx jest w components

export default function CreateTokenPage() {
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [website, setWebsite] = useState("");
  const [post, setPost] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [takeProfit, setTakeProfit] = useState("");
  const [takeProfitCurrency, setTakeProfitCurrency] = useState("SOL");
  const [launchDate, setLaunchDate] = useState("");
  const [launchTime, setLaunchTime] = useState("");
  const [timeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="flex gap-20 p-20">
      {/* Launch Token */}
      <Card
        title="Launch Token"
        description="Configure your token and launch it instantly"
      >
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Token name"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="flex-1 rounded-md px-3 py-2 bg-[#1a1925] text-white placeholder-gray-500 border border-gray-700 outline-none"
          />
          <input
            type="text"
            placeholder="Symbol"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            className="w-28 rounded-md px-3 py-2 bg-[#1a1925] text-white placeholder-gray-500 border border-gray-700 outline-none"
          />
        </div>

        <input
          type="text"
          placeholder="https://example.com"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full rounded-md px-3 py-2 bg-[#1a1925] text-white placeholder-gray-500 border border-gray-700 outline-none"
        />

        <input
          type="text"
          placeholder="https://x.com/"
          value={post}
          onChange={(e) => setPost(e.target.value)}
          className="w-full rounded-md px-3 py-2 bg-[#1a1925] text-white placeholder-gray-500 border border-gray-700 outline-none"
        />

        {image && (
          <img
            src={image}
            alt="Token"
            className="w-20 h-20 object-cover rounded-md"
          />
        )}

        <label className="w-full flex flex-col">
          <span className="text-gray-300 text-sm mb-1">Upload Icon</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="text-gray-300"
          />
        </label>

        <div className="flex gap-2 flex-wrap">
          {["Pump", "Bonk", "USD1"].map((item) => (
            <button
              key={item}
              className="px-3 py-1 bg-[#1a1925] text-gray-300 rounded-md hover:bg-[#232232] transition"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 bg-[#1a1925] text-gray-300 rounded-md hover:bg-[#232232] transition">
            1 SOL →
          </button>
          <button className="flex-1 py-2 bg-[#1a1925] text-gray-300 rounded-md hover:bg-[#232232] transition">
            3 SOL →
          </button>
          <button className="flex-1 py-2 bg-[#1a1925] text-gray-300 rounded-md hover:bg-[#232232] transition">
            5 SOL →
          </button>
        </div>
      </Card>

      {/* Launch Settings */}
      <Card
        title="Launch Settings"
        description="Configure advanced settings for your token launch"
      >
        <label className="text-gray-300 text-sm">
          Takeprofit
          <input
            type="number"
            placeholder="0"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full mt-1 rounded-md px-3 py-2 bg-[#1a1925] text-white border border-gray-700 outline-none"
          />
          <div className="flex gap-2 mt-2">
            <button
              className={`px-3 py-1 rounded-md border ${
                takeProfitCurrency === "SOL"
                  ? "bg-purple-600 text-white"
                  : "bg-[#1a1925] text-gray-300"
              }`}
              onClick={() => setTakeProfitCurrency("SOL")}
            >
              SOL
            </button>
            <button
              className={`px-3 py-1 rounded-md border ${
                takeProfitCurrency === "%"
                  ? "bg-purple-600 text-white"
                  : "bg-[#1a1925] text-gray-300"
              }`}
              onClick={() => setTakeProfitCurrency("%")}
            >
              %
            </button>
          </div>
        </label>

        <label className="text-gray-300 text-sm">
          Launch Date & Time
          <div className="flex gap-2 mt-1">
            <input
              type="date"
              value={launchDate}
              onChange={(e) => setLaunchDate(e.target.value)}
              className="flex-1 rounded-md px-3 py-2 bg-[#1a1925] text-white border border-gray-700 outline-none"
            />
            <input
              type="time"
              value={launchTime}
              onChange={(e) => setLaunchTime(e.target.value)}
              className="flex-1 rounded-md px-3 py-2 bg-[#1a1925] text-white border border-gray-700 outline-none"
            />
          </div>
          <p className="text-gray-400 text-xs mt-1">Timezone: {timeZone}</p>
        </label>
      </Card>
    </div>
  );
}
