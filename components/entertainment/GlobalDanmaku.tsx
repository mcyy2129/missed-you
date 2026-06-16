'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';

export default function GlobalDanmaku() {
  const { danmakuMessages, isDanmakuEnabled, setDanmakuMessages } = useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (danmakuMessages.length === 0) return;
    const timer = setTimeout(() => {
      setDanmakuMessages(prev => prev.filter(m => Date.now() - m.createdAt < 12000));
    }, 1000);
    return () => clearTimeout(timer);
  }, [danmakuMessages, setDanmakuMessages]);

  if (!isDanmakuEnabled || danmakuMessages.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      <AnimatePresence>
        {danmakuMessages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ x: '110vw' }}
            animate={{ x: '-30vw' }}
            exit={{ opacity: 0 }}
            transition={{ duration: msg.speed, ease: 'linear' }}
            className="absolute whitespace-nowrap font-bold text-base select-none"
            style={{
              top: `${msg.top}%`,
              color: msg.color,
              textShadow: `0 0 8px ${msg.color}, 0 0 16px ${msg.color}40`,
              WebkitTextStroke: '0.5px rgba(0,0,0,0.3)',
            }}
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
