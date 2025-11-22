import { useEffect, useState } from "react";

interface NotifyProps {
  message: string;
  duration?: number; // ms
  onClose?: () => void;
}

export default function Notify({ message, duration = 3000, onClose }: NotifyProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  // Animacja wejścia
  useEffect(() => {
    setVisible(true);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p <= 0) {
          clearInterval(interval);
          setVisible(false);
          setTimeout(() => onClose?.(), 300); // czekamy aż exit transition się skończy
          return 0;
        }
        return p - (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  return (
    <div
      className={`
        fixed top-4 right-4 w-72
        bg-[#2a2a38] text-white rounded-lg shadow-lg border border-white/10
        overflow-hidden transition-all duration-300
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="text-gray-400 hover:text-white transition"
        >
          ×
        </button>
      </div>
      <div className="h-1 bg-gray-700">
  <div
    className="h-full bg-green-500"
    style={{
      width: visible ? "0%" : "100%",
      transition: `width ${duration}ms linear`,
    }}
  />
</div>

    </div>
  );
}
