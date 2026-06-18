// @ts-nocheck
"use client";

import { useEffect, useRef, useState } from 'react';

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 768);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; type: 'star' | 'circle' | 'ring' }[] = [];
    let animId: number;
    let mouseX = 0, mouseY = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#5eead4', '#14b8a6', '#2dd4bf', '#99f6e4', '#ccfbf1', '#a7f3d0'];

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      for (let i = 0; i < 2; i++) {
        const type = Math.random() > 0.6 ? 'star' : Math.random() > 0.5 ? 'ring' : 'circle';
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 0.5,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 1.5,
          type
        });
      }
      if (particles.length > 150) particles = particles.slice(-100);
    };

    const drawStar = (cx: number, cy: number, r: number) => {
      const spikes = 4;
      const outerR = r;
      const innerR = r * 0.4;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      }
      ctx.closePath();
      ctx.fill();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter(p => p.life > 0);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01;
        p.life -= 0.015;

        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = p.color;

        if (p.type === 'star') {
          drawStar(p.x, p.y, p.size * p.life);
        } else if (p.type === 'ring') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.size * (1 - p.life) * 3), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.1, p.size * p.life), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Glow around cursor
      ctx.globalAlpha = 0.15;
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 80);
      gradient.addColorStop(0, 'rgba(94, 234, 212, 0.3)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 80, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return <canvas ref={canvasRef} className="fixed inset-0 z-[60] pointer-events-none" />;
}
