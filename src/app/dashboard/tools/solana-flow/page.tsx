"use client";

import { useState, useRef, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import { getClientSession } from "@/lib/authClient";

import Card from "@/components/card/Card";
import Notify from "@/components/Notify";
import SelectBox from "@/components/SelectBox";
import { parseColorTags } from "@/lib/parseColors";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export default function SolanaFlowPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentJobRef = useRef<string | null>(null);

  const [sessionWallet, setSessionWallet] = useState<string | null>(null);
  const [currentWallet, setCurrentWallet] = useState<string | null>(null);
  const [foundToken, setFoundToken] = useState<string | null>(null);

  const [isScanning, setIsScanning] = useState(false);

  const [notify, setNotify] = useState<{ message: string; color: string } | null>(null);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const [minFlow, setMinFlow] = useState(0.1);
  const [maxFlow, setMaxFlow] = useState(10000);
  const [maxTime, setMaxTime] = useState(10);
  const [timeUnit, setTimeUnit] = useState("min"); 

  const [retryCount, setRetryCount] = useState(3);
  const [retryDelay, setRetryDelay] = useState(5);
  const [retryUnit, setRetryUnit] = useState("sec");

  // Pobranie portfela z sesji
  useEffect(() => {
    (async () => {
      const session = await getClientSession();
      if (session?.phantomWallet) setSessionWallet(session.phantomWallet);
    })();
  }, []);

  
  // Scroll logów
  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  
  const handleDone = () => {
    setIsScanning(false);
    currentJobRef.current = null;
  };

  // Socket.IO
  useEffect(() => {
    if (!sessionWallet) return;

    const socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: { wallet: sessionWallet },
    });

    socketRef.current = socket;

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("log", (msg: { message: string }) => setLogs(prev => [...prev, msg.message]));
    socket.on("current-wallet", (data) => setCurrentWallet(data.wallet));
    socket.on("token-found", (data) => setFoundToken(data.token));
    socket.on("solanaFlow-done", (data) => handleDone());
    socket.on("disconnect", () => console.log("Socket disconnected"));

    return () => {
    socket.disconnect();
  };
  }, [sessionWallet]);

  const addLog = (log: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);

  const clearLogs = () => setLogs([]);
  const saveLogs = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStart = () => {
  if (!sessionWallet) return addLog("No wallet connected");

  const wallet = (document.querySelector('input[placeholder="Enter wallet address..."]') as HTMLInputElement)?.value;
  if (!wallet) return addLog("No wallet provided");

  if (!socketRef.current) return addLog("Socket not connected");

socketRef.current.emit("start-solanaFlow", {
  wallet,
  minSol: minFlow,
  maxSol: maxFlow,
  maxTimeDifference: maxTime,
  unit: timeUnit,
  retryCount,
  retryDelay,
  retryUnit
}, (res: unknown) => {
  if (res && typeof res === "object" && "jobId" in res) {
    const r = res as { jobId: string };
    currentJobRef.current = r.jobId;
    addLog(`Started monitoring job ${r.jobId} for ${wallet}`);
    setIsScanning(true);
  } else addLog("Failed to start monitoring");
});
};


const handleStop = () => {
  const jobId = currentJobRef.current;
  if (!jobId || !socketRef.current) return;

  socketRef.current.emit("stop-solanaFlow", jobId, (res: unknown) => {
    // Type guard
    if (res && typeof res === "object" && "stopped" in res) {
      const result = res as { stopped: boolean };
      if (result.stopped) {
        addLog("Monitoring stopped");
      } else {
        addLog("Stop failed");
      }
    } else {
      addLog("Stop failed (unexpected response)");
    }
  });

  handleDone();
};

  const handleCopyWallet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(true);
    setNotify({ message: "Wallet copied!", color: "green" });
    setTimeout(() => setCopiedWallet(false), 1500);
  };

  const handleCopyToken = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setNotify({ message: "Token copied!", color: "green" });
    setTimeout(() => setCopiedToken(false), 1500);
  };

  return (
    <div className="flex flex-col gap-8 text-gray-300">
      {notify && <Notify message={notify.message} onClose={() => setNotify(null)} />}

      {/* Formularz */}
      <Card title="Solana Flow">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">Address:</label>
            <input
              type="text"
              placeholder="Enter wallet address..."
              className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
            />
          </div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
  {/* Min Flow */}
  <div>
    <label className="block text-sm mb-1 text-gray-400">Min SOL flow:</label>
    <input
      type="number"
      value={minFlow}
      onChange={e => setMinFlow(parseFloat(e.target.value))}
      className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
    />
  </div>

  {/* Max Flow */}
  <div>
    <label className="block text-sm mb-1 text-gray-400">Max SOL flow:</label>
    <input
      type="number"
      value={maxFlow}
      onChange={e => setMaxFlow(parseFloat(e.target.value))}
      className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
    />
  </div>

  {/* Max Time */}
  <div>
    <label className="block text-sm mb-1 text-gray-400">Max time:</label>
    <input
      type="number"
      value={maxTime}
      onChange={e => setMaxTime(parseInt(e.target.value))}
      className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
    />
  </div>

  {/* Time Unit */}
  <div>
    <SelectBox
      label="Unit"
      options={[
        { value: "sec", label: "Seconds" },
        { value: "min", label: "Minutes" },
        { value: "hour", label: "Hours" },
        { value: "day", label: "Days" },
      ]}
      defaultValue={timeUnit}
      onChange={(v) => setTimeUnit(v)}
    />
  </div>

  {/* Retry Count */}
  <div>
    <label className="block text-sm mb-1 text-gray-400">Retry Count:</label>
    <input
      type="number"
      min={0}
      value={retryCount}
      onChange={(e) => setRetryCount(parseInt(e.target.value))}
      className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
    />
  </div>

  {/* Retry Delay */}
  <div>
    <label className="block text-sm mb-1 text-gray-400">Retry Delay:</label>
    <input
      type="number"
      min={1}
      value={retryDelay}
      onChange={(e) => setRetryDelay(parseInt(e.target.value))}
      className="w-full rounded-md bg-[#141322] border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#432161]"
    />
  </div>

  {/* Retry Unit */}
  <div>
    <SelectBox
      label="Retry Unit"
      options={[
        { value: "ms", label: "Milliseconds" },
        { value: "sec", label: "Seconds" },
        { value: "min", label: "Minutes" },
        { value: "hour", label: "Hours" },
      ]}
      defaultValue={retryUnit}
      onChange={(v) => setRetryUnit(v)}
    />
  </div>
</div>


          {currentWallet && (
            <div className="flex justify-center items-center gap-2 text-sm mt-4">
              <span className="text-gray-400">Current Wallet:</span>
              <span className="text-[#9d4edd] font-mono">{currentWallet}</span>
              <button
                onClick={() => handleCopyWallet(currentWallet)}
                className={`px-2 py-1 text-xs rounded-md border border-white/10 flex items-center gap-1 transition 
                  ${copiedWallet ? "bg-green-600 text-white" : "bg-[#1a1929] text-gray-300 hover:bg-[#242235]"}`}
              >
                {copiedWallet ? "Copied" : "📃 Copy"}
              </button>
            </div>
          )}

          {foundToken && (
            <div className="flex justify-center items-center gap-2 text-sm mt-2">
              <span className="text-gray-400">Buy token:</span>
              <span className="text-green-400 font-mono">{foundToken}</span>
              <button
                onClick={() => handleCopyToken(foundToken)}
                className={`px-2 py-1 text-xs rounded-md border border-white/10 flex items-center gap-1 transition 
                  ${copiedToken ? "bg-green-600 text-white" : "bg-[#1a1929] text-gray-300 hover:bg-[#242235]"}`}
              >
                {copiedToken ? "Copied" : "📃 Copy"}
              </button>
            </div>
          )}

          <div className="flex justify-center gap-2">
            <button
              onClick={handleStart}
              disabled={isScanning}
              className={`px-6 py-2 mt-2 rounded-md border border-white/10 text-sm font-medium transition ${
                isScanning ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-[#1a1929] text-white hover:bg-[#2d215a]"
              }`}
            >
              Start flow
            </button>

            <button
              onClick={handleStop}
              disabled={!isScanning}
              className={`px-6 py-2 mt-2 rounded-md border border-white/10 text-sm font-medium transition ${
                !isScanning ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-[#4b1a1a] text-white hover:bg-[#742525]"
              }`}
            >
              Stop
            </button>
          </div>
        </div>
      </Card>

      {/* Logi */}
      <Card
  title="Logs"
  actions={
    <div className="flex gap-2">
      <button
        onClick={saveLogs}
        className="px-3 py-1 text-xs rounded-md bg-[#1a1929] border border-white/10 text-gray-300 hover:bg-[#242235] transition"
      >
        Save
      </button>
      <button
        onClick={clearLogs}
        className="px-3 py-1 text-xs rounded-md bg-[#1a1929] border border-white/10 text-gray-300 hover:bg-[#242235] transition"
      >
        Clear
      </button>
    </div>
  }
>
  <div className="h-64 overflow-y-auto font-mono text-sm rounded-md border border-white/10 bg-gradient-to-b from-[#141322] to-[#0d0c1b] p-3">
    {logs.length === 0 ? (
      <p className="text-gray-500 italic">No logs...</p>
    ) : (
      logs.map((log, i) => (
        <div key={i}>
          {parseColorTags(log).map((part, j) => (
            <span key={j} style={{ color: part.color }}>{part.text}</span>
          ))}
        </div>
      ))
    )}
    <div ref={logsEndRef} />
  </div>
</Card>
    </div>
  );
}
