'use client';

import { motion } from 'framer-motion';
import { formatDateSeparator } from '@/lib/time';

interface DateSeparatorProps {
  timestamp: number;
}

export default function DateSeparator({ timestamp }: DateSeparatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center py-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-px w-12 bg-slate-200/60" />
        <span className="text-[11px] text-slate-400/70 font-medium">
          {formatDateSeparator(timestamp)}
        </span>
        <div className="h-px w-12 bg-slate-200/60" />
      </div>
    </motion.div>
  );
}
