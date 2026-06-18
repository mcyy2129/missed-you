// @ts-nocheck
"use client";

import { usePathname } from 'next/navigation';
import { useMusic } from './MusicProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

export default function GlobalMusicPlayer() {
  const pathname = usePathname();
  const { currentSong, isPlaying, togglePlay, nextSong, prevSong, currentLyric, isLoading } = useMusic();
  const [isMounted, setIsMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setIsMounted(true); }, []);

  // Auto-collapse after 5 seconds of no interaction
  useEffect(() => {
    if (!expanded) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setExpanded(false), 5000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [expanded]);

  const isBlog = pathname.startsWith('/blog');
  if (!isMounted || isLoading || !currentSong || isBlog) return null;

  return (
    <div className="fixed top-14 right-4 z-50">
      <AnimatePresence mode="wait">
        {!expanded ? (
          /* Default: small spinning disc ball */
          <motion.div
            key="ball"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(true)}
            className="w-12 h-12 rounded-full cursor-pointer shadow-xl relative overflow-hidden"
            style={{
              border: '2px solid rgba(132, 204, 22, 0.4)',
              boxShadow: '0 0 20px rgba(132, 204, 22, 0.2)',
              animation: isPlaying ? 'spin 4s linear infinite' : 'none',
            }}
          >
            <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10"></div>
            {/* Center dot like vinyl */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white/90 rounded-full shadow-inner border border-white/50"></div>
            {/* Glow ring when playing */}
            {isPlaying && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-[-4px] rounded-full border-2 border-lime-400/40 pointer-events-none"
              />
            )}
          </motion.div>
        ) : (
          /* Expanded: full player card */
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(10, 20, 20, 0.95)',
              border: '1px solid rgba(132, 204, 22, 0.2)',
              backdropFilter: 'blur(24px)',
              width: '280px',
            }}
            onMouseEnter={() => { if (timerRef.current) clearTimeout(timerRef.current); }}
            onMouseLeave={() => { timerRef.current = setTimeout(() => setExpanded(false), 3000); }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(132, 204, 22, 0.6)' }}>Now Playing</span>
              <button onClick={() => setExpanded(false)} className="text-white/30 hover:text-white/60 text-xs transition-colors">✕</button>
            </div>

            {/* Cover + Info */}
            <div className="px-4 pb-3 flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative"
                style={{ animation: isPlaying ? 'spin 6s linear infinite' : 'none' }}
              >
                <img src={currentSong.cover} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/80 rounded-full border border-white/50"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{currentSong.title}</p>
                <p className="text-[10px] text-white/50 truncate">{currentSong.artist}</p>
                <p className="text-[9px] truncate mt-1" style={{ color: 'rgba(132, 204, 22, 0.7)' }}>{currentLyric}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-5 pb-4">
              <button onClick={prevSong} className="text-white/40 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(132, 204, 22, 0.3)', boxShadow: '0 0 20px rgba(132, 204, 22, 0.2)' }}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                )}
              </button>
              <button onClick={nextSong} className="text-white/40 hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
