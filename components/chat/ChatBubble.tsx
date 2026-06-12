'use client';

import { motion } from 'framer-motion';

interface ChatBubbleProps {
  text: string;
  isMe: boolean;
  timestamp: number;
}

export default function ChatBubble({ text, isMe, timestamp }: ChatBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isMe
            ? 'bg-bronze-300 text-brown-800 rounded-br-sm'
            : 'bg-cream-100 text-brown-800 rounded-bl-sm border border-cream-200/60'
        }`}
        style={{
          backgroundImage: isMe
            ? 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
            : 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
        }}
      >
        <p className="text-sm font-sans leading-relaxed whitespace-pre-wrap">{text}</p>
        <p className={`text-[10px] mt-1 ${isMe ? 'text-brown-600/60' : 'text-bronze-500/60'}`}>
          {time}
        </p>
      </div>
    </motion.div>
  );
}
