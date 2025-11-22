"use client";

import React, { useEffect, useRef } from "react";

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;

    // gwiazdy
    let stars: {
      x: number;
      y: number;
      size: number;
      speed: number;
      phase: number;
    }[] = [];

    function resizeCanvas() {
      if (!canvas) return;
      if (!ctx) return;
      vw = window.innerWidth;
      vh = window.innerHeight;

      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      ctx.resetTransform?.(); // czyści poprzednie scale
      ctx.scale(dpr, dpr);

      // nowe gwiazdy
      stars = new Array(120).fill(0).map(() => ({
        x: Math.random() * vw,
        y: Math.random() * vh,
        size: Math.random() * 1.6 + 0.2,
        speed: 0.2 + Math.random() * 1.0,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    function draw() {
      if (!ctx) return;

      // tło
      const g = ctx.createLinearGradient(0, 0, 0, vh);
      g.addColorStop(0, "#04010b");
      g.addColorStop(1, "#050019");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, vw, vh);

      // gwiazdy
      for (const s of stars) {
        s.phase += 0.04;
        const alpha = 0.5 + Math.sin(s.phase) * 0.45;

        ctx.beginPath();
        ctx.shadowColor = `rgba(255,255,255,${alpha})`;
        ctx.shadowBlur = 6;
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        s.y -= s.speed;
        if (s.y < -6) {
          s.y = vh + 6;
          s.x = Math.random() * vw;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    // ustaw od razu i nasłuchuj resize
    resizeCanvas();
    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none -z-20"
      aria-hidden="true"
    />
  );
}
