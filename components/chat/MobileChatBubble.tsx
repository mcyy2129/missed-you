'use client';

import { memo, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageReaction } from '@/lib/types';

interface MobileChatBubbleProps {
  text: string;
  isMe: boolean;
  timestamp: number;
  image?: string;
  audio?: string;
  sticker?: string;
  isRead?: boolean;
  reactions?: MessageReaction[];
  onReact?: (emoji: string) => void;
  senderName?: string;
  senderAvatar?: string;
  showSender?: boolean;
}

const QUICK_REACTIONS = ['❤️', '😊', '👍', '😂', '🥰', '🔥'];

const MobileChatBubble = memo(function MobileChatBubble({ 
  text, isMe, timestamp, image, audio, sticker, isRead, reactions, onReact,
  senderName, senderAvatar, showSender
}: MobileChatBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const groupedReactions = reactions?.reduce<Record<string, string[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.userId);
    return acc;
  }, {});

  const handleLongPressStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      if (onReact) {
        setShowReactionPicker(true);
      }
    }, 500);
  }, [onReact]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  if (sticker) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        <div className="relative">
          {showSender && !isMe && senderAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <img src={senderAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-[10px] text-white/50">{senderName}</span>
            </div>
          )}
          <motion.div
            whileTap={{ scale: 1.1 }}
            className="text-6xl"
            onMouseDown={handleLongPressStart}
            onMouseUp={handleLongPressEnd}
            onMouseLeave={handleLongPressEnd}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
          >
            {sticker}
          </motion.div>
          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <p className="text-[10px] text-white/40">{time}</p>
            {isMe && (
              <span className={`text-[10px] ${isRead ? 'text-rose-500' : 'text-white/40'}`}>
                {isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>

          {groupedReactions && Object.keys(groupedReactions).length > 0 && (
            <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(groupedReactions).map(([emoji, userIds]) => (
                <motion.button
                  key={emoji}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10/60 text-xs"
                  onClick={() => onReact && onReact(emoji)}
                >
                  <span>{emoji}</span>
                  {userIds.length > 1 && <span className="text-[10px] text-white/50">{userIds.length}</span>}
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div className="relative max-w-[80%]">
        {showSender && !isMe && senderAvatar && (
          <div className="flex items-center gap-2 mb-1">
            <img src={senderAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            <span className="text-[10px] text-white/50">{senderName}</span>
          </div>
        )}
        
        <motion.div
          onMouseDown={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={handleLongPressStart}
          onTouchEnd={handleLongPressEnd}
          className={`relative rounded-2xl px-3.5 py-2.5 shadow-sm ${
            isMe
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-br-md'
              : 'bg-white text-white rounded-bl-md border border-white/8'
          }`}
        >
          {image && (
            <div className="mb-2 -mx-1 -mt-1">
              <img src={image} alt="" className="w-full rounded-xl" />
            </div>
          )}
          
          {audio && (
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isMe ? 'bg-white/20' : 'bg-white/5'
              }`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
              <div className="flex items-center gap-[2px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-[3px] rounded-full ${
                      isMe ? 'bg-white/60' : 'bg-slate-300'
                    }`}
                    style={{ height: `${Math.random() * 12 + 4}px` }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {text && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
          )}
          
          <div className={`flex items-center justify-end gap-1 mt-1`}>
            <p className={`text-[10px] ${isMe ? 'text-white/70' : 'text-white/40'}`}>
              {time}
            </p>
            {isMe && (
              <span className={`text-[10px] ${isRead ? 'text-white/90' : 'text-white/50'}`}>
                {isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </motion.div>

        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, userIds]) => (
              <motion.button
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white border border-white/10 shadow-sm text-xs"
                onClick={() => onReact && onReact(emoji)}
              >
                <span>{emoji}</span>
                {userIds.length > 1 && <span className="text-[10px] text-white/50">{userIds.length}</span>}
              </motion.button>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-12 z-10 flex gap-1 bg-white rounded-2xl px-2 py-1.5 shadow-lg border border-white/10`}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    if (onReact) onReact(emoji);
                    setShowReactionPicker(false);
                  }}
                  className="text-xl p-0.5"
                >
                  {emoji}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

export default MobileChatBubble;
