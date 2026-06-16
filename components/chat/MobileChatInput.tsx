'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileChatInputProps {
  onSend: (text: string, image?: string, audio?: string, sticker?: string) => void;
}

export default function MobileChatInput({ onSend }: MobileChatInputProps) {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickEmojis = ['😊', '❤️', '👍', '😄', '🥰', '✨', '🎉', '💪'];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-white/10/60 safe-area-bottom">
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/8"
          >
            <div className="flex flex-wrap gap-2 p-3">
              {quickEmojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    setText(prev => prev + emoji);
                    inputRef.current?.focus();
                  }}
                  className="text-2xl p-1"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 px-3 py-2 max-w-lg mx-auto">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2 rounded-full transition-colors ${
            showEmoji ? 'bg-rose-100 text-rose-500' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="w-full px-4 py-2.5 bg-white/5 rounded-full text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white transition-all"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!text.trim()}
          className={`p-2.5 rounded-full transition-all ${
            text.trim()
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200'
              : 'bg-white/5 text-white/40'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
