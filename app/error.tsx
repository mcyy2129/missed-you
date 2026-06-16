'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm"
      >
        <div className="text-6xl mb-4">💔</div>
        <h1 className="text-3xl font-display font-semibold text-brown-800 mb-2">
          出了点问题
        </h1>
        <p className="text-brown-600 mb-6">
          抱歉，遇到了一个意外错误。请稍后再试。
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="primary" size="md" onClick={reset}>
            重试
          </Button>
          <Button variant="secondary" size="md" onClick={() => (window.location.href = '/')}>
            回到首页
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
