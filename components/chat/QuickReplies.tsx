'use client';

import { motion } from 'framer-motion';

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

export default function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide"
    >
      {replies.map((reply, index) => (
        <motion.button
          key={reply}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(reply)}
          className="shrink-0 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/50 text-xs text-slate-700 hover:bg-slate-200/60 transition-colors"
        >
          {reply}
        </motion.button>
      ))}
    </motion.div>
  );
}
