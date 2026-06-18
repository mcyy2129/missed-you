'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BackToMain() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
      className="fixed top-4 left-4 z-50"
    >
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
        style={{
          background: 'rgba(94, 234, 212, 0.1)',
          color: '#5eead4',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(94, 234, 212, 0.2)',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 19-7-7 7-7" />
          <path d="M19 12H5" />
        </svg>
        回来
      </Link>
    </motion.div>
  );
}
