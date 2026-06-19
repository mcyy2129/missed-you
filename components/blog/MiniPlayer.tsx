// @ts-nocheck
"use client";

import { useMusic } from './MusicProvider';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';

const fmt = (t: number) => {
  if (!t || isNaN(t)) return '0:00';
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
};

interface MiniPlayerProps {
  onOpenPlayer: () => void;
}

export default function MiniPlayer({ onOpenPlayer }: MiniPlayerProps) {
  const {
    currentSong, isPlaying, progress, currentTime, duration,
    currentLyric, isLoading, togglePlay, nextSong, prevSong,
    handleSeek, handleSeekStart, handleSeekEnd
  } = useMusic();

  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    handleSeek({ target: { value: String(pct) } } as any);
  }, [handleSeek]);

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
  }, [isDragging, handleProgressMove, handleProgressUp]);

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

  if (!isMounted || isLoading || !currentSong) return null;

  const displayProgress = isDragging ? dragProgress : progress;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999]">
      {/* Progress bar at the very top of the mini player */}
      <div
        ref={progressBarRef}
        className="relative h-1 bg-white/10 cursor-pointer group"
        onClick={handleProgressClick}
        onMouseDown={handleProgressDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-none"
          style={{ width: `${displayProgress}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${displayProgress}% - 6px)` }}
        />
      </div>

      {/* Mini player bar */}
      <div
        className="bg-[#0d1f1f]/95 backdrop-blur-xl border-t border-teal-500/10 px-3 py-2"
        onClick={onOpenPlayer}
      >
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {/* Cover */}
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
            <img src={currentSong.cover} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentSong.title || currentSong.name}</p>
            <p className="text-[10px] text-teal-400/60 truncate">{currentSong.artist}</p>
          </div>

          {/* Time */}
          <div className="text-[9px] text-teal-400/40 tabular-nums flex-shrink-0">
            {fmt(currentTime)} / {fmt(duration)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button onClick={prevSong} className="w-8 h-8 flex items-center justify-center text-teal-400/60 hover:text-teal-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button onClick={togglePlay} className="w-9 h-9 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
              {isPlaying
                ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                : <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
            <button onClick={nextSong} className="w-8 h-8 flex items-center justify-center text-teal-400/60 hover:text-teal-400 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
