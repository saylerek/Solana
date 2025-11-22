"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const toolLinks = [
  { href: "/dashboard/wallets/main", label: "Main" },
  { href: "/dashboard/wallets/dev", label: "Dev" },
  { href: "/dashboard/wallets/bundlers", label: "Bundlers" },
];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Pasek nawigacyjny dla Tools */}
      <div className="flex justify-center mt-1">
        <div className="flex items-center gap-6 px-6 py-2 rounded-xl bg-[#0e0d1a]/80 border border-white/10 backdrop-blur-md shadow-md">
          {toolLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-sm font-medium px-3 py-1.5 rounded-md transition-all ${
                  active
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 rounded-full bg-gradient-to-r from-purple-500/60 via-pink-500/60 to-indigo-500/60" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Kontent strony */}
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}
