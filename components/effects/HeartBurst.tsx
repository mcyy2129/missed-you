'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HeartBurstProps {
  show: boolean;
  onComplete?: () => void;
}

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  rotation: number;
}

function generateHearts(count: number): Heart[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 250 + 80),
    size: 16 + Math.random() * 24,
    delay: Math.random() * 0.3,
    rotation: (Math.random() - 0.5) * 60,
  }));
}

export default function HeartBurst({ show, onComplete }: HeartBurstProps) {
  const [hearts] = useState(() => generateHearts(20));

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onComplete?.(), 1800);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <div className="relative">
            {hearts.map((heart) => (
              <motion.span
                key={heart.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  x: heart.x,
                  y: heart.y,
                  scale: [0, 1.2, 1, 0.6],
                  rotate: heart.rotation,
                }}
                transition={{
                  duration: 1.4,
                  delay: heart.delay,
                  ease: 'easeOut',
                }}
                className="absolute text-rose-400"
                style={{ fontSize: heart.size }}
              >
                ♥
              </motion.span>
            ))}

            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 200 }}
              className="relative z-10 text-center"
            >
              <p className="text-3xl font-display font-bold text-brown-800 drop-shadow-lg">
                It&apos;s a Match!
              </p>
              <p className="text-sm text-bronze-500 mt-1">你们互相喜欢</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
