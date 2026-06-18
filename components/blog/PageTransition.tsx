// @ts-nocheck
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function StarTransitionOverlay({ isActive }: { isActive: boolean }) {
  const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    if (isActive) {
      const newStars = Array.from({ length: 30 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 0.3,
        color: ['#5eead4', '#14b8a6', '#2dd4bf', '#99f6e4', '#a7f3d0'][Math.floor(Math.random() * 5)]
      }));
      setStars(newStars);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      {/* Dark sweep */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0a1a1a, #0d2626)' }}
        initial={{ clipPath: 'circle(0% at 50% 50%)' }}
        animate={{ clipPath: 'circle(150% at 50% 50%)' }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Stars */}
      {stars.map((star, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: star.color,
            boxShadow: `0 0 ${star.size * 4}px ${star.color}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 0.8,
            delay: star.delay + 0.2,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Center glow burst */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.8), transparent)', boxShadow: '0 0 60px 30px rgba(94,234,212,0.3)' }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 20, 30], opacity: [1, 0.5, 0] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Radial light rays */}
      {[0, 45, 90, 135].map((angle) => (
        <motion.div
          key={angle}
          className="absolute top-1/2 left-1/2 origin-center"
          style={{
            width: '2px',
            height: '200vh',
            background: 'linear-gradient(to bottom, transparent, rgba(94,234,212,0.3), transparent)',
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        />
      ))}
    </motion.div>
  );
}

export default function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);
  const [displayPath, setDisplayPath] = useState(pathname);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (pathname !== displayPath) {
      setTransitioning(true);
      setTimeout(() => {
        setDisplayPath(pathname);
        setShowContent(true);
        setTimeout(() => setTransitioning(false), 400);
      }, 300);
    } else {
      setShowContent(true);
    }
  }, [pathname]);

  return (
    <>
      <AnimatePresence>
        {transitioning && <StarTransitionOverlay isActive={transitioning} />}
      </AnimatePresence>

      <motion.div
        className={className}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 12 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: transitioning ? 0.4 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
