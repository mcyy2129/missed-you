// @ts-nocheck
"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { siteConfig } from '@/siteConfig_blog';

// 【增强版 LRC 歌词解析】
function parseLrc(lrcText: string) {
  if (!lrcText || lrcText.length > 30000) return [];

  const lines = lrcText.split(/\r?\n/);
  const result = [];

  for (let line of lines) {
    const matches = [...line.matchAll(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?\]/g)];
    if (matches.length > 0) {
      let text = line.replace(/\[\d{2,}:\d{2}(?:\.\d{2,3})?\]/g, '').trim();

      // 剔除控制字符
      const cleanText = text.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, "");

      if (cleanText) {
        for (const match of matches) {
          const min = parseInt(match[1]);
          const sec = parseInt(match[2]);
          const ms = match[3] ? parseInt(match[3]) : 0;
          const divisor = match[3] && match[3].length === 3 ? 1000 : 100;
          const time = min * 60 + sec + ms / divisor;
          result.push({ time, text: cleanText });
        }
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

// 🌟 1. 扩充 Context 类型，加入 MusicPage 需要的所有属性
type PlayMode = 'loop' | 'single' | 'random';

interface MusicContextType {
  playlist: any[];
  currentIndex: number;
  currentSong: any; // 扩展了 lyrics 属性
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  currentLyric: string;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  playMode: PlayMode;

  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  playSong: (index: number) => void;
  playSearchResult: (song: any) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

const STORAGE_KEY = 'blog-music-state';

function loadMusicState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveMusicState(state: any) {
  try {
    // Only save essential fields, not full lyrics (too large)
    const toSave = {
      playlist: state.playlist.map((s: any) => ({
        id: s.id, title: s.title, artist: s.artist, cover: s.cover,
        src: s.src, originalUrl: s.originalUrl,
      })),
      currentIndex: state.currentIndex,
      volume: state.volume,
      isMuted: state.isMuted,
      playMode: state.playMode,
      currentTime: state.currentTime,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const saved = typeof window !== 'undefined' ? loadMusicState() : null;

  const [playlist, setPlaylist] = useState<any[]>(saved?.playlist || []);
  const [currentIndex, setCurrentIndex] = useState(saved?.currentIndex || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(saved?.currentTime || 0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState(saved?.playlist?.length ? "恢复上次播放..." : "正在连接高可用神经云端...");
  const [isLoading, setIsLoading] = useState(true);

  const [volume, setVolumeState] = useState(saved?.volume ?? 1);
  const [isMuted, setIsMuted] = useState(saved?.isMuted ?? false);
  const [playMode, setPlayMode] = useState<PlayMode>(saved?.playMode || 'loop');

  const audioRef = useRef<HTMLAudioElement>(null);

  // Save state whenever it changes
  useEffect(() => {
    if (playlist.length > 0) {
      saveMusicState({ playlist, currentIndex, volume, isMuted, playMode, currentTime });
    }
  }, [playlist, currentIndex, volume, isMuted, playMode, currentTime]);

  useEffect(() => {
    let isMounted = true;
    const fetchMusicData = async () => {
      try {
        const res = await fetch(`/blog/api/music?ids=${siteConfig.cloudMusicIds.join(',')}`);
        const rawResults = await res.json();

        const mergedPlaylist = rawResults
          .filter((song: any) => song && song.url && !song.error)
          .map((song: any) => ({
            id: song.id || Math.random().toString(),
            title: song.name || '未知歌曲',
            artist: song.artist || song.author || '未知歌手',
            cover: song.cover || song.pic || 'https://bu.dusays.com/2026/03/24/69c24230a5ff8.jpg',
            src: `/blog/api/music/stream?url=${encodeURIComponent(song.url)}`,
            lrcUrl: null,
            lyrics: song.lrc ? parseLrc(song.lrc) : [],
            originalUrl: song.url,
          }));

        if (isMounted) {
          if (mergedPlaylist.length > 0) {
            // Merge: keep searched songs from saved state, append default songs not already present
            if (saved?.playlist?.length) {
              const savedIds = new Set(saved.playlist.map((s: any) => s.id));
              const newDefaultSongs = mergedPlaylist.filter((s: any) => !savedIds.has(s.id));
              setPlaylist([...saved.playlist, ...newDefaultSongs]);
              // Restore lyrics for current song
              const currentSaved = saved.playlist[saved.currentIndex] || saved.playlist[0];
              if (currentSaved) {
                const fullSong = mergedPlaylist.find((s: any) => s.id === currentSaved.id);
                if (fullSong?.lyrics) {
                  setLyrics(fullSong.lyrics);
                }
              }
            } else {
              setPlaylist(mergedPlaylist);
            }
          } else {
            setCurrentLyric("云端链路受阻");
          }
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) { setCurrentLyric("网络初始化失败"); setIsLoading(false); }
      }
    };

    if (siteConfig.cloudMusicIds?.length > 0) fetchMusicData();
    else setIsLoading(false);

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (playlist.length === 0) return;
    let isMounted = true;
    const currentSong = playlist[currentIndex];
    setLyrics([]);
    setCurrentLyric("♪ 正在缓冲 ♪");
    if (currentSong.lyrics && currentSong.lyrics.length > 0) {
      if (isMounted) {
        setLyrics(currentSong.lyrics);
        setCurrentLyric(currentSong.lyrics[0]?.text || "\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a");
      }
    } else if (currentSong.lrcUrl) {
      fetch(currentSong.lrcUrl)
        .then(res => res.text())
        .then(text => {
          if (isMounted) {
             const parsed = parseLrc(text);
             setLyrics(parsed);
             setPlaylist(prev => {
                const newPlaylist = [...prev];
                newPlaylist[currentIndex].lyrics = parsed;
                return newPlaylist;
             });
          }
        })
        .catch(() => { if (isMounted) setCurrentLyric("\u266a \u7eaf\u4eab\u97f3\u4e50 \u266a"); });
    }

    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => setIsPlaying(false));
      }
    }
    return () => { isMounted = false; };
  }, [currentIndex, playlist.length]); // 移除 playlist 依赖防止无限循环，只依赖长度

  // 🌟 4. 同步音量到 audio 元素
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(!isPlaying);
    }
  };

  // 🌟 5. 重写 nextSong，加入对随机模式的处理
  const nextSong = () => {
    if (playMode === 'random') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((prev) => (prev + 1) % playlist.length);
    }
  };

  const prevSong = () => {
    if (playMode === 'random') {
      setCurrentIndex(Math.floor(Math.random() * playlist.length));
    } else {
      setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    }
  };

  // 🌟 6. 暴露直接播放指定歌曲的方法
  const playSong = (index: number) => {
    setCurrentIndex(index);
    if (!isPlaying) setIsPlaying(true); // 保证切歌后自动播放
  };

  // 播放搜索结果（临时添加到播放列表）
  const playSearchResult = (song: any) => {
    const proxiedSong = {
      id: song.id || Math.random().toString(),
      title: song.name || song.title || '未知歌曲',
      artist: song.artist || song.author || '未知歌手',
      cover: song.cover || song.pic || 'https://bu.dusays.com/2026/03/24/69c24230a5ff8.jpg',
      src: `/blog/api/music/stream?url=${encodeURIComponent(song.url || `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`)}`,
      lyrics: [],
    };
    setPlaylist(prev => [proxiedSong, ...prev.filter((s: any) => s.id !== proxiedSong.id)]);
    setCurrentIndex(0);
    setIsPlaying(true);
    setCurrentLyric("♪ 正在播放搜索结果 ♪");
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      setCurrentTime(currentTime);
      setDuration(duration || 0);
      setProgress((currentTime / (duration || 1)) * 100);

      if (lyrics.length > 0) {
        const activeLyric = lyrics.slice().reverse().find(l => currentTime >= l.time);
        if (activeLyric && activeLyric.text !== currentLyric) {
          setCurrentLyric(activeLyric.text);
        }
      }
    }
  };

  // 🌟 7. 处理歌曲结束
  const handleEnded = () => {
    if (playMode === 'single' && audioRef.current) {
       audioRef.current.currentTime = 0;
       audioRef.current.play();
    } else {
       nextSong();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (isMuted && val > 0) setIsMuted(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const togglePlayMode = () => {
    setPlayMode(prev => {
      if (prev === 'loop') return 'single';
      if (prev === 'single') return 'random';
      return 'loop';
    });
  };

  const currentSong = playlist[currentIndex];

  return (
    <MusicContext.Provider value={{
        playlist, currentIndex, currentSong, isPlaying, progress, currentTime, duration, currentLyric, isLoading,
        volume, isMuted, playMode, // 暴露新状态
        togglePlay, nextSong, prevSong, handleSeek,
        playSong, playSearchResult, setVolume, toggleMute, togglePlayMode // 暴露新方法
    }}>
      {children}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={() => {
            handleTimeUpdate();
            // Restore saved playback position on first load
            if (saved?.currentTime && audioRef.current && audioRef.current.duration > 0) {
              const restoreTime = Math.min(saved.currentTime, audioRef.current.duration - 1);
              if (restoreTime > 0 && audioRef.current.currentTime < 1) {
                audioRef.current.currentTime = restoreTime;
              }
            }
          }}
        />
      )}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
};
