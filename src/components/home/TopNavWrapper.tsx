"use client";

import { useEffect, useState } from "react";
import TopNavContent from "./TopNavContent"; // <--- poprawny import

export default function TopNavWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <TopNavContent />;
}
