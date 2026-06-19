// @ts-nocheck
"use client";

import { useMusic } from './MusicProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const fmt = (t: number) => {
  if (!t || isNaN(t)) return '0:00';
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
};

interface PopupPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PopupPlayer({ isOpen, onClose }: PopupPlayerProps) {
  const {
    playlist, currentSong, isPlaying, progress, currentTime, duration,
    currentLyric, isLoading, togglePlay, nextSong, prevSong,
    handleSeek, handleSeekStart, handleSeekEnd, playSong, playMode, togglePlayMode,
    volume, setVolume, isMuted, toggleMute
  } = useMusic();

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lyricRef = useRef<HTMLDivElement>(null);
  const activeLyricRef = useRef<HTMLDivElement>(null);

  // Parse lyrics
  const lyrics = useMemo(() => {
    if (!currentSong) return [];
    const raw = currentSong.lrc || currentSong.lyric;
    if (Array.isArray(currentSong.lyrics) && currentSong.lyrics.length > 0) return currentSong.lyrics;
    if (!raw || typeof raw !== 'string') return [];
    const lines = raw.split('\n');
    const p: any[] = [];
    const re = /\[(\d{2,}):(\d{2})(?:[.:](\d{2,3}))?\]/g;
    for (const l of lines) {
      const t = l.replace(/\[\d{2,}:\d{2}(?:[.:]\d{2,3})?\]/g, '').trim();
      if (!t) continue;
      let m;
      while ((m = re.exec(l)) !== null) {
        const ms = m[3] ? parseFloat(`0.${m[3]}`) : 0;
        p.push({ time: parseInt(m[1]) * 60 + parseInt(m[2]) + ms, text: t });
      }
    }
    return p.sort((a, b) => a.time - b.time);
  }, [currentSong?.id]);

  const activeLyricIdx = useMemo(() => {
    if (!lyrics.length) return -1;
    let i = lyrics.findIndex((l: any) => l.time > currentTime) - 1;
    if (i === -2) i = lyrics.length - 1;
    return Math.max(0, i);
  }, [currentTime, lyrics]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeLyricRef.current && lyricRef.current && !isDragging) {
      const container = lyricRef.current;
      const el = activeLyricRef.current;
      container.scrollTo({
        top: el.offsetTop - container.offsetHeight / 2 + el.offsetHeight / 2,
        behavior: 'smooth'
      });
    }
  }, [activeLyricIdx, isDragging]);

  // Progress bar dragging
  const handleProgressDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    handleSeekStart();
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setDragProgress(pct);
    handleSeek({ target: { value: String(pct) } } as any);
  }, [handleSeek, handleSeekStart]);

  const handleProgressMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setDragProgress(pct);
    handleSeek({ target: { value: String(pct) } } as any);
  }, [isDragging, handleSeek]);

  const handleProgressUp = useCallback(() => {
    setIsDragging(false);
    handleSeekEnd();
  }, [handleSeekEnd]);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    handleSeekStart();
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setDragProgress(pct);
    handleSeek({ target: { value: String(pct) } } as any);
  }, [handleSeek, handleSeekStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setDragProgress(pct);
    handleSeek({ target: { value: String(pct) } } as any);
  }, [isDragging, handleSeek]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressMove);
      window.addEventListener('mouseup', handleProgressUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleProgressUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleProgressMove);
      window.removeEventListener('mouseup', handleProgressUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleProgressUp);
    };
  }, [isDragging, handleProgressMove, handleProgressUp, handleTouchMove]);

  if (!currentSong) return null;

  const displayProgress = isDragging ? dragProgress : progress;
  const playModeIcon = playMode === 'single' ? '1' : playMode === 'random' ? '🔀' : '🔁';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col"
          style={{ background: 'linear-gradient(180deg, #0a1a1a 0%, #0d2626 50%, #0a1a1a 100%)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-teal-400/60 hover:text-teal-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className="text-center">
              <p className="text-[10px] text-teal-400/40 font-medium tracking-widest">正在播放</p>
            </div>
            <button onClick={() => setShowPlaylist(!showPlaylist)} className="w-8 h-8 flex items-center justify-center text-teal-400/60 hover:text-teal-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </button>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-hidden">
            {showPlaylist ? (
              /* Playlist view */
              <div className="w-full max-w-md h-full overflow-y-auto no-scrollbar pb-4">
                <p className="text-xs text-teal-400/40 mb-3 font-medium">播放列表 ({playlist.length})</p>
                <div className="flex flex-col gap-1.5">
                  {playlist.map((s: any, idx: number) => {
                    const active = s.id === currentSong.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => { playSong(idx); }}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-teal-500/15' : 'hover:bg-teal-500/5'}`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img src={s.cover} className="w-full h-full object-cover" />
                          {active && isPlaying && (
                            <div className="absolute inset-0 bg-teal-500/30 flex items-center justify-center">
                              <div className="flex gap-[2px] items-end h-2">
                                <span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" />
                                <span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_200ms]" />
                                <span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_400ms]" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${active ? 'text-teal-400' : 'text-white'}`}>{s.title || s.name}</p>
                          <p className="text-[10px] text-teal-400/50 truncate">{s.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Player view */
              <>
                {/* Cover art */}
                <motion.div
                  className="relative w-56 h-56 md:w-72 md:h-72 mb-8"
                  animate={{ scale: isPlaying ? 1 : 0.9 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  <div className="absolute inset-0 rounded-full blur-[40px] opacity-30" style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.4), transparent)' }} />
                  <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 ${isPlaying ? 'animate-[spin_20s_linear_infinite]' : ''}`}>
                    <img src={currentSong.cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#0a1a1a]/80 rounded-full border border-white/10" />
                </motion.div>

                {/* Song info */}
                <div className="w-full max-w-md text-center mb-6">
                  <h2 className="text-xl font-black text-white truncate">{currentSong.title || currentSong.name}</h2>
                  <p className="text-sm text-teal-400/60 mt-1">{currentSong.artist}</p>
                </div>

                {/* Lyrics */}
                {lyrics.length > 0 && (
                  <div ref={lyricRef} className="w-full max-w-md h-20 overflow-hidden no-scrollbar mb-4">
                    <div className="flex flex-col items-center gap-2">
                      {lyrics.slice(Math.max(0, activeLyricIdx - 2), activeLyricIdx + 3).map((l: any, i: number) => {
                        const realIdx = Math.max(0, activeLyricIdx - 2) + i;
                        const active = realIdx === activeLyricIdx;
                        const dist = Math.abs(realIdx - activeLyricIdx);
                        return (
                          <p
                            key={realIdx}
                            ref={active ? activeLyricRef : null}
                            className={`text-center transition-all duration-500 ${active ? 'text-base font-bold text-teal-400' : dist <= 1 ? 'text-xs text-teal-400/30' : 'text-[10px] text-teal-400/15'}`}
                          >
                            {l.text}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="w-full max-w-md mb-4">
                  <div
                    ref={progressBarRef}
                    className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                    onMouseDown={handleProgressDown}
                    onTouchStart={handleTouchStart}
                  >
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-none"
                      style={{ width: `${displayProgress}%` }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `calc(${displayProgress}% - 8px)` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-teal-400/40 tabular-nums">{fmt(currentTime)}</span>
                    <span className="text-[10px] text-teal-400/40 tabular-nums">{fmt(duration)}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <button onClick={togglePlayMode} className="p-2 text-teal-400/40 hover:text-teal-400 transition-colors">
                    <span className="text-sm">{playModeIcon}</span>
                  </button>
                  <button onClick={prevSong} className="p-2 text-teal-400/60 hover:text-teal-400 transition-colors">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                  </button>
                  <button onClick={togglePlay} className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform">
                    {isPlaying
                      ? <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                      : <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    }
                  </button>
                  <button onClick={nextSong} className="p-2 text-teal-400/60 hover:text-teal-400 transition-colors">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                  </button>
                  <button onClick={toggleMute} className="p-2 text-teal-400/40 hover:text-teal-400 transition-colors">
                    {isMuted
                      ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                      : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    }
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <svg className="w-4 h-4 text-teal-400/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  <input
                    type="range" min="0" max="100"
                    value={isMuted ? 0 : volume * 100}
                    onChange={(e) => setVolume(Number(e.target.value) / 100)}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer bg-white/10"
                    style={{ background: `linear-gradient(to right, #5eead4 ${isMuted ? 0 : volume * 100}%, rgba(94,234,212,0.1) 0)` }}
                  />
                  <svg className="w-4 h-4 text-teal-400/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" /></svg>
                </div>
              </>
            )}
          </div>

          <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
