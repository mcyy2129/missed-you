'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import SwipeDeck from '@/components/match/SwipeDeck';
import HeartBurst from '@/components/effects/HeartBurst';

export default function MatchPage() {
  const router = useRouter();
  const [showBurst, setShowBurst] = useState(false);
  const handleMatch = useCallback(() => {
    setShowBurst(true);
  }, []);

  const handleBurstComplete = useCallback(() => {
    setShowBurst(false);
  }, []);

  return (
    <div className="relative min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-semibold text-white mb-1">
            匹配
          </h1>
          <p className="text-sm text-white/50">
            选择你喜欢的匹配方式
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/match/soul')}
            className="flex-1 rounded-2xl p-4 text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.3), rgba(132, 204, 22, 0.1))', border: '1px solid rgba(132, 204, 22, 0.3)' }}
          >
            <div className="text-2xl mb-2">💫</div>
            <div className="text-sm font-medium">灵魂匹配</div>
            <div className="text-xs text-white/50 mt-1">随机遇见最懂你的人</div>
          </motion.button>
          
          <div className="flex-1 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(132, 204, 22, 0.4)' }}>
            <div className="text-2xl mb-2">👆</div>
            <div className="text-sm font-medium text-white">滑动匹配</div>
            <div className="text-xs text-white/50 mt-1">左滑跳过，右滑喜欢</div>
          </div>
        </div>

        <SwipeDeck onMatch={handleMatch} />
      </main>

      <HeartBurst show={showBurst} onComplete={handleBurstComplete} />

      <BottomNav />
    </div>
  );
}
