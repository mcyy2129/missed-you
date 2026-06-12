'use client';

import { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
  rotationSpeed: number;
  speedY: number;
  amplitude: number;
  frequency: number;
  phase: number;
  opacity: number;
  hue: number;
}

export default function PetalParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const PARTICLE_COUNT = 30;
    let petals: Petal[] = [];

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function createPetal(): Petal {
      return {
        x: Math.random() * canvas!.width,
        y: -20 - Math.random() * canvas!.height,
        radiusX: 3 + Math.random() * 5,
        radiusY: 6 + Math.random() * 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        speedY: 0.3 + Math.random() * 0.6,
        amplitude: 20 + Math.random() * 40,
        frequency: 0.005 + Math.random() * 0.01,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.1 + Math.random() * 0.3,
        hue: 25 + Math.random() * 30,
      };
    }

    function init() {
      resize();
      petals = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = createPetal();
        p.y = Math.random() * canvas!.height;
        petals.push(p);
      }
    }

    function drawPetal(p: Petal) {
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      ctx!.beginPath();
      ctx!.ellipse(0, 0, p.radiusX, p.radiusY, 0, 0, Math.PI * 2);
      ctx!.fillStyle = `hsla(${p.hue}, 50%, 75%, ${p.opacity})`;
      ctx!.fill();
      ctx!.closePath();
      ctx!.restore();
    }

    let tick = 0;

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      tick++;

      for (const p of petals) {
        p.y += p.speedY;
        p.x += Math.sin(tick * p.frequency + p.phase) * p.amplitude * 0.01;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas!.height + 20) {
          Object.assign(p, createPetal());
        }

        drawPetal(p);
      }

      animId = requestAnimationFrame(animate);
    }

    init();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
    />
  );
}
