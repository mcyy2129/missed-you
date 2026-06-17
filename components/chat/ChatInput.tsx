'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSend: (text: string, image?: string, audio?: string, sticker?: string) => void;
}

const EMOJI_PAGES = [
  ['😊', '❤️', '🥰', '😂', '😍', '💕', '🥺', '✨', '🌸', '🎉', '👋', '🔥', '💫', '🌙', '☕'],
  ['😘', '💋', '💗', '💖', '💝', '🌹', '🍫', '🎁', '🎈', '🎊', '🎵', '🎶', '💫', '⭐', '🌟'],
  ['😄', '😁', '😆', '🤣', '😜', '🤪', '😎', '🤗', '🤭', '😋', '😛', '🫶', '👐', '🤝', '👏'],
];

const STICKERS = ['😘', '🥰', '😍', '🤗', '🤭', '😋', '😛', '😜', '🤪', '😎', '🥺', '😭', '😤', '🤯', '😴'];

export default function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [emojiPage, setEmojiPage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !imagePreview) return;
    onSend(trimmed, imagePreview || undefined);
    setText('');
    setImagePreview(null);
    setShowEmojis(false);
    setShowStickers(false);
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

  const sendSticker = (sticker: string) => {
    onSend('', undefined, undefined, sticker);
    setShowStickers(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-white/6 safe-area-bottom">
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/8"
          >
            <div className="px-4 py-2 flex items-center gap-3">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="预览"
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={removeImage}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <p className="text-xs text-white/50">点击发送按钮发送图片</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-white/8">
              <div className="flex gap-2 mb-2">
                {EMOJI_PAGES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setEmojiPage(idx)}
                    className={`w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                      emojiPage === idx
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/5 text-white/40 hover:bg-white/8'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {EMOJI_PAGES[emojiPage].map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => insertEmoji(emoji)}
                    className="text-xl p-1 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStickers && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 px-4 py-3 border-b border-white/8">
              {STICKERS.map((sticker) => (
                <motion.button
                  key={sticker}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => sendSticker(sticker)}
                  className="text-3xl p-1"
                >
                  {sticker}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2 px-3 py-2 max-w-lg mx-auto">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShowEmojis(!showEmojis);
            setShowStickers(false);
          }}
          className={`p-2 rounded-full transition-colors ${
            showEmojis ? 'bg-rose-100 text-rose-500' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setShowStickers(!showStickers);
            setShowEmojis(false);
          }}
          className={`p-2 rounded-full transition-colors ${
            showStickers ? 'bg-rose-100 text-rose-500' : 'text-white/40 hover:text-white/60'
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-white/40 hover:text-white/60 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
            className="w-full px-4 py-2.5 bg-white/5 rounded-full text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-lime-500/20 focus:bg-white/8 transition-all border border-white/8"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
          disabled={!text.trim() && !imagePreview}
          className={`p-2.5 rounded-full transition-all ${
            text.trim() || imagePreview
              ? 'bg-gradient-to-r from-lime-500/30 to-emerald-500/30 text-lime-400 border border-lime-500/30 shadow-md shadow-lime-500/10'
              : 'bg-white/5 text-white/40'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
}
