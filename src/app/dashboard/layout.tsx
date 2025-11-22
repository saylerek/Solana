"use client";

import StarBackground from "@/components/background/background";
import TopNavWrapper from "@/components/home/TopNavWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <main className="relative min-h-screen flex flex-col">
      <StarBackground />
      <div className="absolute inset-0 -z-10" />
      <TopNavWrapper />
      <div className="flex-grow p-6 md:p-12">{children}</div>
    </main>
  );
}
