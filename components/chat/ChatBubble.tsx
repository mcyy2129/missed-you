'use client';

import { memo, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageReaction } from '@/lib/types';

interface ChatBubbleProps {
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

function generateWaveHeights(): number[] {
  return Array.from({ length: 12 }, () => Math.random() * 16 + 4);
}

const ChatBubble = memo(function ChatBubble({ 
  text, isMe, timestamp, image, audio, sticker, isRead, reactions, onReact,
  senderName, senderAvatar, showSender
}: ChatBubbleProps) {
  const time = new Date(timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  
  const waveHeights = useMemo(() => generateWaveHeights(), []);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDoubleClick = () => {
    if (onReact) {
      onReact('❤️');
    }
  };

  const groupedReactions = reactions?.reduce<Record<string, string[]>>((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.userId);
    return acc;
  }, {});

  if (sticker) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
      >
        <div className="relative group">
          {showSender && !isMe && senderAvatar && (
            <div className="flex items-center gap-2 mb-1">
              <img src={senderAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-[10px] text-slate-500">{senderName}</span>
            </div>
          )}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-6xl cursor-pointer"
            onDoubleClick={handleDoubleClick}
          >
            {sticker}
          </motion.div>
          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            <p className="text-[10px] text-slate-400">{time}</p>
            {isMe && (
              <span className={`text-[10px] flex items-center ${isRead ? 'text-rose-500' : 'text-slate-400'}`}>
                {isRead ? (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 12 7 17 17 7" />
                    <polyline points="8 12 13 17 23 7" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="2 12 7 17 17 7" />
                  </svg>
                )}
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
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/60 text-xs hover:bg-slate-200/60 transition-colors"
                  onClick={() => onReact && onReact(emoji)}
                >
                  <span>{emoji}</span>
                  {userIds.length > 1 && <span className="text-[10px] text-slate-500">{userIds.length}</span>}
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
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      <div className="relative max-w-[75%] group">
        {showSender && !isMe && senderAvatar && (
          <div className="flex items-center gap-2 mb-1">
            <img src={senderAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
            <span className="text-[10px] text-slate-500">{senderName}</span>
          </div>
        )}
        <div
          className={`relative rounded-2xl shadow-sm overflow-hidden ${
            isMe
              ? 'rounded-br-md'
              : 'rounded-bl-md'
          }`}
          onDoubleClick={handleDoubleClick}
        >
          {audio && (
            <div
              className={`px-4 py-3 ${
                isMe
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                  : 'bg-slate-100 text-slate-800 border border-slate-200/60'
              }`}
            >
              <audio
                ref={audioRef}
                src={audio}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePlayPause}
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isMe
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-slate-200/50 hover:bg-slate-200/70'
                  } transition-colors`}
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </motion.button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[3px]">
                    {waveHeights.map((height, i) => (
                      <motion.div
                        key={i}
                        animate={isPlaying ? {
                          height: [height, Math.random() * 20 + 4, height],
                        } : {}}
                        transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.05 }}
                        className={`w-[3px] rounded-full ${
                          isMe ? 'bg-white/70' : 'bg-slate-400/50'
                        }`}
                        style={{ height: `${height}px` }}
                      />
                    ))}
                  </div>
                  <p className={`text-[10px] mt-1.5 ${isMe ? 'text-white/80' : 'text-slate-500'}`}>
                    {audioDuration > 0 ? formatDuration(audioDuration) : '语音消息'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {image && !audio && (
            <div className="bg-slate-100">
              <img
                src={image}
                alt="照片"
                className="w-full max-w-[260px] h-auto object-cover"
              />
            </div>
          )}

          {text && (
            <div
              className={`px-4 py-2.5 ${
                isMe
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                  : 'bg-slate-100 text-slate-800 border border-slate-200/60'
              } ${(image || audio) ? (isMe ? 'rounded-t-none' : 'rounded-t-none border-t-0') : ''}`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <p className={`text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                  {time}
                </p>
                {isMe && (
                  <span className={`text-[10px] flex items-center ${isRead ? 'text-white/90' : 'text-white/50'}`}>
                    {isRead ? (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="2 12 7 17 17 7" />
                        <polyline points="8 12 13 17 23 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="2 12 7 17 17 7" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            </div>
          )}

          {!text && (image || audio) && (
            <div className="flex items-center justify-end gap-1 px-4 py-1.5">
              <p className={`text-[10px] ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                {time}
              </p>
              {isMe && (
                <span className={`text-[10px] flex items-center ${isRead ? 'text-white/90' : 'text-white/50'}`}>
                  {isRead ? (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 12 7 17 17 7" />
                      <polyline points="8 12 13 17 23 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="2 12 7 17 17 7" />
                    </svg>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className={`flex gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(groupedReactions).map(([emoji, userIds]) => (
              <motion.button
                key={emoji}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs hover:bg-slate-50 transition-colors"
                onClick={() => onReact && onReact(emoji)}
              >
                <span>{emoji}</span>
                {userIds.length > 1 && <span className="text-[10px] text-slate-500">{userIds.length}</span>}
              </motion.button>
            ))}
          </div>
        )}

        {onReact && (
          <div className={`absolute top-0 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs hover:bg-slate-50 transition-colors"
            >
              😊
            </button>
          </div>
        )}

        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className={`absolute ${isMe ? 'right-0' : 'left-0'} -top-12 z-10 flex gap-1 bg-white rounded-2xl px-2.5 py-1.5 shadow-lg border border-slate-200`}
            >
              {QUICK_REACTIONS.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (onReact) {
                      onReact(emoji);
                    }
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

export default ChatBubble;
