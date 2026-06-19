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
  handleSeekEnd: () => void;
  playSong: (index: number) => void;
  playSearchResult: (song: any) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  togglePlayMode: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

const STORAGE_KEY = 'blog-music-state';

function loadMusicState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveMusicState(state: any) {
  if (typeof window === 'undefined') return;
  try {
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
  const [saved, setSaved] = useState<any>(null);
  const [ready, setReady] = useState(false);

  // Load saved state after mount (client-only)
  useEffect(() => {
    setSaved(loadMusicState());
    setReady(true);
  }, []);

  const [playlist, setPlaylist] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState("正在连接高可用神经云端...");
  const [isLoading, setIsLoading] = useState(true);

  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('loop');
  const [isSeeking, setIsSeeking] = useState(false);
  const isSeekingRef = useRef(false);
  const seekTargetRef = useRef<number | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Apply saved state after it loads
  useEffect(() => {
    if (!saved) return;
    if (saved.playlist?.length) setPlaylist(saved.playlist);
    if (saved.currentIndex) setCurrentIndex(saved.currentIndex);
    if (saved.currentTime) setCurrentTime(saved.currentTime);
    if (saved.volume !== undefined) setVolumeState(saved.volume);
    if (saved.isMuted !== undefined) setIsMuted(saved.isMuted);
    if (saved.playMode) setPlayMode(saved.playMode);
    if (saved.playlist?.length) setCurrentLyric("恢复上次播放...");
  }, [saved]);

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
              // Re-fetch lyrics for current song from mergedPlaylist
              const currentSaved = saved.playlist[saved.currentIndex] || saved.playlist[0];
              if (currentSaved) {
                const fullSong = mergedPlaylist.find((s: any) => s.id === currentSaved.id);
                if (fullSong?.lyrics && fullSong.lyrics.length > 0) {
                  setLyrics(fullSong.lyrics);
                  setCurrentLyric(fullSong.lyrics[0]?.text || "♪ 纯享音乐 ♪");
                } else {
                  // Try fetching lyrics from API for this song
                  try {
                    const lrcRes = await fetch(`/blog/api/music?ids=${currentSaved.id}`);
                    const lrcData = await lrcRes.json();
                    if (lrcData[0]?.lrc) {
                      const parsed = parseLrc(lrcData[0].lrc);
                      setLyrics(parsed);
                      if (parsed.length > 0) setCurrentLyric(parsed[0].text);
                    }
                  } catch {}
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
  }, [saved]);

  useEffect(() => {
    if (playlist.length === 0) return;
    let isMounted = true;
    const currentSong = playlist[currentIndex];
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
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
    } else if (currentSong.id && !isNaN(Number(currentSong.id))) {
      // Fallback: fetch lyrics from API by song ID
      fetch(`/blog/api/music?ids=${currentSong.id}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data[0]?.lrc) {
            const parsed = parseLrc(data[0].lrc);
            setLyrics(parsed);
            if (parsed.length > 0) setCurrentLyric(parsed[0].text);
            setPlaylist(prev => {
              const newPlaylist = [...prev];
              newPlaylist[currentIndex].lyrics = parsed;
              return newPlaylist;
            });
          }
        })
        .catch(() => {});
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
  // Pre-check if a song URL is playable (returns true if audio)
  const checkSongPlayable = async (url: string): Promise<boolean> => {
    try {
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      const ct = res.headers.get('content-type') || '';
      return res.ok && (ct.includes('audio') || ct.includes('mpeg') || ct.includes('ogg') || ct.includes('wav'));
    } catch { return false; }
  };

  const playSearchResult = async (song: any) => {
    const streamUrl = `/blog/api/music/stream?url=${encodeURIComponent(song.url || `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`)}`;

    // Pre-check if playable
    const playable = await checkSongPlayable(streamUrl);
    if (!playable) {
      setCurrentLyric("♪ 该歌曲暂无法播放 ♪");
      return;
    }

    const proxiedSong = {
      id: song.id || Math.random().toString(),
      title: song.name || song.title || '未知歌曲',
      artist: song.artist || song.author || '未知歌手',
      cover: song.cover || song.pic || 'https://bu.dusays.com/2026/03/24/69c24230a5ff8.jpg',
      src: streamUrl,
      lyrics: [],
    };
    setPlaylist(prev => [proxiedSong, ...prev.filter((s: any) => s.id !== proxiedSong.id)]);
    setCurrentIndex(0);
    setIsPlaying(true);
    setCurrentLyric("♪ 正在播放 ♪");
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeekingRef.current) {
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
    setIsSeeking(true);
    isSeekingRef.current = true;
    if (audioRef.current && audioRef.current.duration) {
      const targetTime = (newProgress / 100) * audioRef.current.duration;
      seekTargetRef.current = targetTime;
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleSeekEnd = () => {
    if (audioRef.current && seekTargetRef.current !== null) {
      const checkSeekDone = () => {
        if (!audioRef.current || seekTargetRef.current === null) return;
        const actual = audioRef.current.currentTime;
        const target = seekTargetRef.current;
        if (Math.abs(actual - target) < 1) {
          seekTargetRef.current = null;
          isSeekingRef.current = false;
          setIsSeeking(false);
        } else {
          setTimeout(checkSeekDone, 100);
        }
      };
      checkSeekDone();
    } else {
      seekTargetRef.current = null;
      isSeekingRef.current = false;
      setTimeout(() => setIsSeeking(false), 200);
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
        togglePlay, nextSong, prevSong, handleSeek, handleSeekEnd,
        playSong, playSearchResult, setVolume, toggleMute, togglePlayMode // 暴露新方法
    }}>
      {children}
      {currentSong && (
        <audio
          ref={audioRef}
          src={currentSong.src}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={() => {
            // Remove failed song and try next
            setPlaylist(prev => {
              const updated = prev.filter((_: any, i: number) => i !== currentIndex);
              if (updated.length === 0) {
                setCurrentLyric("♪ 所有歌曲暂无法播放 ♪");
                setIsPlaying(false);
              }
              return updated;
            });
          }}
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
