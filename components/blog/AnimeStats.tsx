// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AnimeStats({ postCount, chatterCount, photoCount, buildDate }: { postCount: number; chatterCount: number; photoCount: number; buildDate: string }) {
  const [uptime, setUptime] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      const diff = now.getTime() - new Date(buildDate).getTime();
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      setUptime(`${days}d ${hours}h`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [buildDate]);

  const stats = [
    { label: '文章', value: postCount, icon: '📄', color: 'from-teal-500 to-emerald-500' },
    { label: '杂谈', value: chatterCount, icon: '💬', color: 'from-cyan-500 to-blue-500' },
    { label: '照片', value: photoCount, icon: '📷', color: 'from-emerald-500 to-green-500' },
  ];

  return (
    <div className="w-full glass-card p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-emerald-500/5 pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        {/* Clock */}
        <div className="bg-[#0a1a1a]/60 rounded-xl px-4 py-2 border border-teal-500/10">
          <p className="text-lg font-black text-white neon-text tabular-nums font-mono">{time || '00:00:00'}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 md:gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2">
              <span className="text-sm">{s.icon}</span>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white">{s.value}</span>
                <span className="text-[9px] font-bold text-teal-400/70 uppercase tracking-widest">{s.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Uptime */}
        <div className="hidden md:flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <span className="text-[10px] font-bold text-teal-400/70">UP {uptime}</span>
        </div>
      </div>
    </div>
  );
}
