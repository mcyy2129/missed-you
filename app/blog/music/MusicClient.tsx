// @ts-nocheck
"use client";

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, RefreshCcw, Disc3, Volume2, VolumeX, Search, X, Music, Loader2, Download, Heart, Sparkles, Globe } from 'lucide-react';
import Navbar from '@/components/blog/Navbar';
import PageTransition from '@/components/blog/PageTransition';
import { useMusic } from '@/components/blog/MusicProvider';

const fmt = (t: number) => { if (!t || isNaN(t)) return '0:00'; return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; };

export default function MusicClient() {
  const { playlist, currentSong, isPlaying, progress, currentTime, duration, currentLyric, isLoading, togglePlay, nextSong, prevSong, handleSeek, handleSeekEnd, playSong, playSearchResult, playMode, togglePlayMode, volume, setVolume, isMuted, toggleMute } = useMusic();

  const lyricRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<'lyrics' | 'playlist' | 'search'>('lyrics');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [lyrics, setLyrics] = useState<any[]>([]);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [fsLyrics, setFsLyrics] = useState(false);

  useEffect(() => {
    if (!currentSong) { setLyrics([]); return; }
    const raw = currentSong.lrc || currentSong.lyric || (typeof currentSong.lyrics === 'string' ? currentSong.lyrics : '');
    if (Array.isArray(currentSong.lyrics) && currentSong.lyrics.length > 0) { setLyrics(currentSong.lyrics); return; }
    if (!raw || typeof raw !== 'string') { setLyrics([]); return; }
    const lines = raw.split('\n'); const p: any[] = [];
    const re = /\[(\d{2,}):(\d{2})(?:[.:](\d{2,3}))?\]/g; let ht = false;
    for (const l of lines) {
      const t = l.replace(/\[\d{2,}:\d{2}(?:[.:]\d{2,3})?\]/g, '').trim();
      if (!t) continue; let m;
      while ((m = re.exec(l)) !== null) { ht = true; const ms = m[3] ? parseFloat(`0.${m[3]}`) : 0; p.push({ time: parseInt(m[1]) * 60 + parseInt(m[2]) + ms, text: t }); }
    }
    setLyrics(ht ? p.sort((a, b) => a.time - b.time) : lines.map(l => ({ time: -1, text: l.trim() })).filter(l => l.text));
  }, [currentSong?.id]);

  const activeIdx = useMemo(() => {
    if (!lyrics.length) return -1;
    let i = lyrics.findIndex((l: any) => l.time > currentTime) - 1;
    if (i === -2) i = lyrics.length - 1; return Math.max(0, i);
  }, [currentTime, lyrics]);

  useEffect(() => {
    if (activeRef.current && lyricRef.current && tab === 'lyrics' && !fsLyrics) {
      const c = lyricRef.current, a = activeRef.current;
      c.scrollTo({ top: a.offsetTop - c.offsetHeight / 2 + a.offsetHeight / 2, behavior: 'smooth' });
    }
  }, [activeIdx, tab, fsLyrics]);

  const search = useCallback(async () => {
    if (!q.trim()) return; setLoading(true);
    try { const r = await fetch(`/blog/api/music/search?keyword=${encodeURIComponent(q.trim())}&limit=30`); const d = await r.json(); setResults(d.songs || []); setTotal(d.total || 0); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  }, [q]);

  const dl = (s: any) => {
    const u = `/blog/api/music/download?url=${encodeURIComponent(s.url || `https://music.163.com/song/media/outer/url?id=${s.id}.mp3`)}&filename=${encodeURIComponent(`${s.name || s.title} - ${s.artist || s.author}.mp3`)}`;
    const a = document.createElement('a'); a.href = u; a.download = ''; a.click();
  };

  const toggleLike = (id: number) => { setLiked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const filtered = useMemo(() => {
    if (!q.trim() || tab !== 'playlist') return playlist;
    const l = q.toLowerCase(); return playlist.filter((s: any) => (s.title || s.name || '').toLowerCase().includes(l) || (s.artist || s.author || '').toLowerCase().includes(l));
  }, [playlist, q, tab]);

  if (isLoading || !currentSong) return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a1a1a' }}>
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}><Disc3 size={48} className="text-teal-500" /></motion.div>
        <span className="font-black text-teal-400 tracking-widest text-sm">唤醒音乐引擎中~</span>
      </div>
    </div>
  );

  const cover = currentSong.cover || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1000&auto=format&fit=crop';

  const lyricView = (
    <div className="h-full overflow-y-auto no-scrollbar px-4 py-8">
      <div className="py-[35vh] flex flex-col gap-5 text-center">
        {lyrics.length > 0 ? lyrics.map((l: any, i: number) => {
          const active = i === activeIdx; const dist = Math.abs(i - activeIdx);
          const op = dist === 0 ? 1 : dist <= 5 ? 0.7 - dist * 0.12 : 0.1;
          const sc = dist === 0 ? 1.08 : dist <= 3 ? 0.95 : 0.85;
          return (
            <motion.div key={i} ref={active ? activeRef : null} animate={{ opacity: op, scale: sc, y: active ? -8 : 0 }} transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
              className={`cursor-pointer px-3 py-2 rounded-2xl transition-all duration-500 ${active ? 'bg-teal-500/10 backdrop-blur-sm' : ''}`}
              onClick={() => duration > 0 && handleSeek({ target: { value: String((l.time / duration) * 100) } } as any)}>
              <p className={`font-black tracking-tight leading-relaxed transition-all duration-500 ${active ? 'text-xl md:text-2xl gradient-text' : 'text-sm md:text-base text-slate-400'}`}>{l.text}</p>
            </motion.div>
          );
        }) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}><Music size={40} className="text-teal-500/30" /></motion.div>
            <p className="text-sm font-black text-teal-400 animate-pulse">{currentLyric || '等待旋律降临~'}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaylist = (compact = false) => (
    <div className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-2'}`}>
      {filtered.map((s: any) => {
        const idx = playlist.findIndex((p: any) => p.id === s.id); const active = s.id === currentSong.id;
        return (
          <div key={s.id} onClick={() => playSong(idx)} className={`group flex items-center gap-3 ${compact ? 'p-2.5 rounded-xl' : 'p-3 rounded-2xl'} cursor-pointer transition-all ${active ? 'bg-teal-500/10' : 'hover:bg-teal-500/5'}`}>
            <div className={`relative ${compact ? 'w-10 h-10' : 'w-12 h-12'} shrink-0 rounded-lg overflow-hidden`}>
              <img src={s.cover || s.pic} className="w-full h-full object-cover" />
              {active && isPlaying && <div className="absolute inset-0 bg-teal-500/30 flex items-center justify-center"><div className="flex gap-[2px] items-end h-2"><span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_0ms]" /><span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_200ms]" /><span className="w-0.5 bg-white rounded-full animate-[bounce_1s_infinite_400ms]" /></div></div>}
            </div>
            <div className="flex flex-col truncate min-w-0 flex-1">
              <span className={`${compact ? 'text-xs' : 'text-[15px]'} font-black truncate ${active ? 'text-teal-400' : 'text-white'}`}>{s.title || s.name}</span>
              <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-teal-400/50 truncate`}>{s.artist || s.author}</span>
            </div>
            {!compact && <button onClick={(e) => { e.stopPropagation(); dl(s); }} className="p-1 text-teal-400/40 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"><Download size={14} /></button>}
          </div>
        );
      })}
    </div>
  );

  const renderSearch = (compact = false) => (
    <div className="flex flex-col h-full">
      <div className={`flex ${compact ? 'gap-2 mb-3' : 'gap-3 mb-4'} shrink-0`}>
        <div className="flex-1 relative group">
          <Search className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} absolute left-3 top-1/2 -translate-y-1/2 text-teal-400/40`} />
          <input type="text" placeholder="搜索音乐..." value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            className={`w-full ${compact ? 'h-10 pl-9 pr-8 text-xs' : 'h-12 pl-10 pr-10 text-sm'} bg-teal-500/5 border border-teal-500/15 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-white`} />
          {q && <button onClick={() => { setQ(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={12} className="text-teal-400/40" /></button>}
        </div>
        <button onClick={search} disabled={loading || !q.trim()} className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 flex-shrink-0`}>
          {loading ? <Loader2 size={compact ? 14 : 18} className="animate-spin" /> : <Search size={compact ? 14 : 18} />}
        </button>
      </div>
      {total > 0 && <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-teal-400/50 mb-2`}>找到 {total} 首歌曲</p>}
      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-1.5">
        {results.map(s => (
          <div key={s.id} onClick={() => playSearchResult(s)} className={`group flex items-center gap-3 ${compact ? 'p-2.5 rounded-xl' : 'p-3 rounded-2xl'} cursor-pointer hover:bg-teal-500/5 transition-all`}>
            <div className={`relative ${compact ? 'w-10 h-10' : 'w-12 h-12'} shrink-0 rounded-lg overflow-hidden bg-teal-500/10`}>
              {s.cover ? <img src={s.cover} className="w-full h-full object-cover" /> : <Music size={compact ? 12 : 16} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-400/30" />}
            </div>
            <div className="flex flex-col truncate min-w-0 flex-1">
              <span className={`${compact ? 'text-xs' : 'text-sm'} font-black text-white truncate group-hover:text-teal-400 transition-colors`}>{s.name}</span>
              <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-teal-400/50 truncate`}>{s.artist}</span>
            </div>
            {!compact && s.duration > 0 && <span className="text-[10px] text-teal-400/30 tabular-nums">{fmt(s.duration)}</span>}
            <button onClick={(e) => { e.stopPropagation(); dl(s); }} className="p-1 text-teal-400/30 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"><Download size={compact ? 12 : 14} /></button>
          </div>
        ))}
        {!loading && !results.length && q && <p className="text-sm text-teal-400/30 text-center py-8">没有找到相关歌曲~</p>}
        {!q && <p className="text-sm text-teal-400/20 text-center py-8">搜索你喜欢的音乐</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative pb-24 md:pb-10 flex flex-col" style={{ background: '#0a1a1a' }}>
      <Navbar />
      <PageTransition>
        <div className="w-full max-w-7xl mx-auto mt-20 md:mt-28 px-3 sm:px-6 md:px-10 relative z-10">
          <motion.div className="mb-4 md:mb-8 text-center md:text-left" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl md:text-5xl font-black tracking-widest gradient-text">云端乐律</h1>
            <p className="text-[10px] md:text-base text-teal-400/50 font-medium tracking-wider">在代码的缝隙中寻找灵魂的共鸣~</p>
          </motion.div>

          {/* Mobile */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <motion.div className={`w-14 h-14 rounded-full border border-teal-500/20 overflow-hidden relative ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}>
                  <img src={cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-teal-500/10"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/80 rounded-full border border-teal-500/30"></div>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-black text-white truncate">{currentSong.title || currentSong.name}</h3>
                  <p className="text-[9px] text-teal-400/60 truncate">{currentSong.artist}</p>
                  <p className="text-[8px] text-teal-400/40 truncate mt-0.5">{currentLyric}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toggleLike(currentSong.id)} className="w-8 h-8 rounded-full flex items-center justify-center bg-teal-500/10"><Heart size={14} className={liked.has(currentSong.id) ? 'text-teal-400 fill-teal-400' : 'text-teal-400/30'} /></button>
                  <button onClick={togglePlay} className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">{isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}</button>
                </div>
              </div>
              <div className="px-1 pb-2 flex items-center gap-2 mt-3">
                <span className="text-[8px] text-teal-400/40 w-7 text-right">{fmt(currentTime)}</span>
                <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd} className="flex-1 h-1 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #5eead4 ${progress}%, rgba(94,234,212,0.1) 0)` }} />
                <span className="text-[8px] text-teal-400/40 w-7">{fmt(duration)}</span>
              </div>
              <div className="flex items-center justify-center gap-5 pb-1">
                <button onClick={togglePlayMode} className="p-1">{playMode === 'single' ? <RefreshCcw size={14} className="text-emerald-400" /> : playMode === 'random' ? <Shuffle size={14} className="text-teal-400/40" /> : <Repeat size={14} className="text-teal-400/40" />}</button>
                <button onClick={prevSong} className="p-1 text-teal-400/60"><SkipBack size={16} fill="currentColor" /></button>
                <button onClick={nextSong} className="p-1 text-teal-400/60"><SkipForward size={16} fill="currentColor" /></button>
                <button onClick={toggleMute} className="p-1 text-teal-400/50">{isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}</button>
                <button onClick={() => dl(currentSong)} className="p-1 text-teal-400/50"><Download size={14} /></button>
              </div>
            </div>
            <div className="flex p-1 glass-card">{([['lyrics', '歌词'], ['playlist', '歌单'], ['search', '搜索']] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k as any)} className={`flex-1 py-2 rounded-full text-xs font-black transition-all ${tab === k ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white' : 'text-teal-400/50'}`}>{l}</button>)}</div>
            <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 310px)', minHeight: '280px' }}>
              {tab === 'lyrics' && lyricView}
              {tab === 'playlist' && <div className="h-full overflow-y-auto no-scrollbar p-3">{renderPlaylist(true)}</div>}
              {tab === 'search' && <div className="h-full p-3">{renderSearch(true)}</div>}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:grid md:grid-cols-12 gap-6 w-full md:h-[calc(100vh-320px)] md:min-h-[600px] md:max-h-[720px]">
            <div className="md:col-span-5 flex flex-col glass-card p-6 md:p-10 relative overflow-hidden shrink-0">
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.2), transparent)' }}></div>
              <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full">
                <div className="relative w-48 h-48 lg:w-64 lg:h-64 mb-6 lg:mb-10 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
                  <motion.div className="absolute inset-0 m-auto w-[85%] h-[85%] rounded-full blur-[35px] z-0" style={{ background: 'radial-gradient(circle, rgba(94,234,212,0.2), transparent)' }} animate={{ opacity: isPlaying ? 0.9 : 0.3, scale: isPlaying ? 1.1 : 1 }} />
                  <div className="absolute inset-0 m-auto w-[90%] h-[90%] rounded-full z-0" style={{ boxShadow: '0 0 40px -5px rgba(94,234,212,0.2)' }}></div>
                  <motion.div className={`absolute inset-0 w-full h-full rounded-full shadow-2xl overflow-hidden z-10 rotating-disc ${isPlaying ? 'scale-100' : 'scale-95'}`} style={{ border: '4px solid rgba(255,255,255,0.1)', animationPlayState: isPlaying ? 'running' : 'paused' }}>
                    <img src={cover} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 m-auto w-12 h-12 bg-teal-900/80 backdrop-blur-md rounded-full z-30 shadow-inner border border-teal-500/20"></div>
                  </motion.div>
                  <motion.div className="absolute w-4 h-4 z-30" animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ top: '50%', left: '50%' }}><span className="text-teal-400 text-lg">{'\u2728'}</span></motion.div>
                </div>
                <div className="w-full text-center px-4 mb-4">
                  <h1 className="text-xl lg:text-2xl font-black truncate gradient-text">{currentSong.title || currentSong.name}</h1>
                  <h2 className="text-sm font-bold text-teal-400/60 truncate mt-2 tracking-widest">{currentSong.artist}</h2>
                </div>
              </div>
              <div className="w-full mt-auto relative z-20">
                <div className="w-full flex flex-col gap-1.5 mb-6 px-3">
                  <input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #5eead4 ${progress}%, rgba(94,234,212,0.1) 0)` }} />
                  <div className="flex justify-between text-xs font-bold text-teal-400/40 tabular-nums"><span>{fmt(currentTime)}</span><span>{fmt(duration)}</span></div>
                </div>
                <div className="w-full flex items-center justify-between px-2 lg:px-4">
                  <button onClick={togglePlayMode} className="p-2">{playMode === 'single' ? <RefreshCcw size={18} className="text-emerald-400" /> : playMode === 'random' ? <Shuffle size={18} className="text-teal-400/40" /> : <Repeat size={18} className="text-teal-400/40" />}</button>
                  <div className="flex items-center gap-4 lg:gap-6">
                    <button onClick={prevSong} className="p-2 text-teal-400/60 hover:text-teal-400"><SkipBack size={28} fill="currentColor" /></button>
                    <motion.button onClick={togglePlay} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-xl" style={{ boxShadow: '0 8px 30px rgba(94,234,212,0.3)' }}>
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </motion.button>
                    <button onClick={nextSong} className="p-2 text-teal-400/60 hover:text-teal-400"><SkipForward size={28} fill="currentColor" /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => dl(currentSong)} className="p-2 text-teal-400/40 hover:text-teal-400"><Download size={18} /></button>
                    <button onClick={() => toggleLike(currentSong.id)} className="p-2"><Heart size={18} className={liked.has(currentSong.id) ? 'text-teal-400 fill-teal-400' : 'text-teal-400/30'} /></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-7 flex flex-col glass-card relative overflow-hidden md:h-auto shrink-0">
              <div className="flex items-center justify-center gap-1 p-1 mt-6 mx-auto glass-card shrink-0 z-20">
                {([['lyrics', '歌词'], ['playlist', '歌单'], ['search', '搜索']] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k as any)} className={`flex-1 py-2 px-4 rounded-full font-black text-[13px] transition-all ${tab === k ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white' : 'text-teal-400/50'}`}>{l}</button>)}
              </div>
              <div className="flex-1 relative mt-2 flex flex-col overflow-hidden">
                {tab === 'lyrics' && (<>
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a1a1a]/60 to-transparent z-10 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a1a1a]/60 to-transparent z-10 pointer-events-none" />
                  <button onClick={() => setFsLyrics(true)} className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full flex items-center justify-center text-teal-400 hover:text-white transition-all hover:scale-110 active:scale-95" style={{ background: 'rgba(94,234,212,0.15)', border: '1px solid rgba(94,234,212,0.3)' }}><Sparkles size={16} /></button>
                  <div ref={lyricRef} className="h-full overflow-y-auto no-scrollbar">{lyricView}</div>
                </>)}
                {tab === 'playlist' && <div className="absolute inset-0 px-4 md:px-8 pb-8 pt-4 flex flex-col overflow-y-auto no-scrollbar"><div className="mb-4 shrink-0"><input type="text" placeholder="搜索歌单..." value={q} onChange={e => setQ(e.target.value)} className="w-full h-10 px-4 bg-teal-500/5 border border-teal-500/15 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/30 text-white" /></div>{renderPlaylist()}</div>}
                {tab === 'search' && <div className="absolute inset-0 px-4 md:px-8 pb-8 pt-4 flex flex-col overflow-y-auto no-scrollbar">{renderSearch()}</div>}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>

      {/* Fullscreen lyrics */}
      <AnimatePresence>
        {fsLyrics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col" style={{ background: '#0a1a1a' }}>
            <button onClick={() => setFsLyrics(false)} className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400"><X size={20} /></button>
            <div className="absolute top-0 left-0 right-0 h-1 z-10" style={{ background: `linear-gradient(to right, #5eead4 ${progress}%, transparent 0)` }} />
            <div className="p-6 flex items-center gap-4 border-b border-teal-500/10">
              <motion.div className={`w-12 h-12 rounded-full overflow-hidden border border-teal-500/20 ${isPlaying ? 'animate-[spin_6s_linear_infinite]' : ''}`}><img src={cover} className="w-full h-full object-cover" /></motion.div>
              <div className="flex-1 min-w-0"><h3 className="text-sm font-black truncate gradient-text">{currentSong.title}</h3><p className="text-[10px] text-teal-400/50 truncate">{currentSong.artist}</p></div>
              <div className="flex gap-2">
                <button onClick={prevSong} className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400"><SkipBack size={14} fill="currentColor" /></button>
                <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">{isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}</button>
                <button onClick={nextSong} className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400"><SkipForward size={14} fill="currentColor" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="py-[30vh] px-6 md:px-16 flex flex-col gap-6 text-center">
                {lyrics.map((l: any, i: number) => {
                  const active = i === activeIdx; const dist = Math.abs(i - activeIdx);
                  return (
                    <motion.div key={i} animate={{ opacity: dist === 0 ? 1 : dist <= 5 ? 0.7 - dist * 0.12 : 0.1, scale: dist === 0 ? 1.15 : dist <= 3 ? 0.95 : 0.8, y: active ? -12 : 0 }}
                      transition={{ duration: 0.6, type: 'spring', stiffness: 80 }} className={`cursor-pointer transition-all duration-600 ${active ? 'py-3 px-4 rounded-3xl bg-teal-500/5' : ''}`}
                      onClick={() => duration > 0 && handleSeek({ target: { value: String((l.time / duration) * 100) } } as any)}>
                      <p className={`font-black tracking-tight leading-relaxed ${active ? 'text-2xl md:text-4xl gradient-text' : 'text-base md:text-xl text-slate-500'}`}>{l.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-teal-500/10">
              <div className="flex items-center gap-3 mb-3"><span className="text-[10px] text-teal-400/40 w-10 text-right tabular-nums">{fmt(currentTime)}</span><input type="range" min="0" max="100" value={progress || 0} onChange={handleSeek} onMouseUp={handleSeekEnd} onTouchEnd={handleSeekEnd} className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, #5eead4 ${progress}%, rgba(94,234,212,0.1) 0)` }} /><span className="text-[10px] text-teal-400/40 w-10 tabular-nums">{fmt(duration)}</span></div>
              <div className="flex items-center justify-center gap-6">
                <button onClick={togglePlayMode} className="p-2">{playMode === 'single' ? <RefreshCcw size={16} className="text-emerald-400" /> : playMode === 'random' ? <Shuffle size={16} className="text-teal-400/40" /> : <Repeat size={16} className="text-teal-400/40" />}</button>
                <button onClick={toggleMute} className="p-2 text-teal-400/40">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                <button onClick={() => dl(currentSong)} className="p-2 text-teal-400/40 hover:text-teal-400"><Download size={16} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .rotating-disc { animation: spin 20s linear infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
