'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';

export default function EntertainmentPage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-14 pb-16">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 z-40 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.8)' }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [0.8, 1, 0.8], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-12 h-12 rounded-full mx-auto mb-4"
                  style={{ background: 'linear-gradient(135deg, #84cc16, #22d3ee)' }}
                />
                <p className="text-sm text-white/60">加载中...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
