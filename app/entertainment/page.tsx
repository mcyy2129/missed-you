'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export default function EntertainmentPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="pt-14 pb-16">
        {loading && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-lime-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-white/50">加载中...</p>
            </div>
          </div>
        )}

        <iframe
          src="https://forum.hanakos.cc/"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 112px)', minHeight: '600px' }}
          onLoad={() => setLoading(false)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </main>

      <BottomNav />
    </div>
  );
}
