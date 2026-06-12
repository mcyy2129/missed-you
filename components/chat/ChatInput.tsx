'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSend: (text: string) => void;
}

const EMOJIS = ['😊', '❤️', '🥰', '😂', '😍', '💕', '🥺', '✨', '🌸', '🎉', '👋', '🔥', '💫', '🌙', '☕'];

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-cream-50/90 backdrop-blur-md border-t border-cream-200/50">
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-cream-200/30">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => insertEmoji(emoji)}
                  className="text-xl hover:scale-125 transition-transform p-1"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 px-4 py-3 max-w-lg mx-auto">
        <button
          onClick={() => setShowEmojis((prev) => !prev)}
          className="text-lg text-bronze-400 hover:text-bronze-300 transition-colors shrink-0"
        >
          😊
        </button>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="flex-1 rounded-full bg-cream-100 border border-bronze-300/10 px-4 py-2 text-sm font-sans text-brown-800 placeholder:text-brown-600/40 focus:outline-none focus:ring-2 focus:ring-bronze-300/30 transition-shadow"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!text.trim()}
          className="shrink-0 w-9 h-9 rounded-full bg-bronze-300 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bronze-400 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
