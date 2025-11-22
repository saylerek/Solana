"use client";

import { ReactNode } from "react";

interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  transparency?: number; // 0–100 (% przezroczystości tła)
}

export default function Card({
  title,
  description,
  children,
  actions,
  transparency = 30,
}: CardProps) {
  const opacity = Math.min(Math.max(0, 100 - transparency), 100);

  return (
    <div
      className="flex-1 p-6 rounded-xl shadow-lg border border-white/10"
      style={{
        backgroundColor: `rgba(11, 10, 22, ${opacity / 100})`,
      }}
    >
      {/* Nagłówek */}
      <div className="relative mb-4">
        <h2 className="text-white text-lg font-bold text-center">{title}</h2>
        {actions && (
          <div className="absolute top-0 right-0 flex gap-2">{actions}</div>
        )}
      </div>

      {/* Opis */}
      {description && (
        <p className="text-gray-400 text-sm mb-6 text-center">{description}</p>
      )}

      {/* Zawartość */}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
