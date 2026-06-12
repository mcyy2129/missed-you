'use client';

import { useState, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import SwipeDeck from '@/components/match/SwipeDeck';
import HeartBurst from '@/components/effects/HeartBurst';

export default function MatchPage() {
  const [showBurst, setShowBurst] = useState(false);
  const handleMatch = useCallback(() => {
    setShowBurst(true);
  }, []);

  const handleBurstComplete = useCallback(() => {
    setShowBurst(false);
  }, []);

  return (
    <div className="relative min-h-screen bg-cream-50">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-semibold text-brown-800 mb-1">
            匹配
          </h1>
          <p className="text-sm text-bronze-500">
            左滑跳过，右滑喜欢
          </p>
        </div>

        <SwipeDeck onMatch={handleMatch} />
      </main>

      <HeartBurst show={showBurst} onComplete={handleBurstComplete} />

      <BottomNav />
    </div>
  );
}
