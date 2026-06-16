'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm"
      >
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="text-3xl font-display font-semibold text-white mb-2">
          404
        </h1>
        <p className="text-white/60 mb-6">
          这个页面似乎不存在，可能它也迷路了
        </p>
        <Button variant="primary" size="md" onClick={() => (window.location.href = '/')}>
          回到首页
        </Button>
      </motion.div>
    </div>
  );
}
