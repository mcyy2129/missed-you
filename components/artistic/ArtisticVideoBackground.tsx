'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';

interface ArtisticVideoBackgroundProps {
  videoProgress: ReturnType<typeof useMotionValue>;
}

export default function ArtisticVideoBackground({ videoProgress }: ArtisticVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsReady(true);
    };

    const handleCanPlay = () => {
      video.play().catch(() => {
        video.muted = true;
        video.play();
      });
    };

    const handleTimeUpdate = () => {
      if (duration > 0) {
        const progress = video.currentTime / duration;
        lastProgressRef.current = progress;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || duration === 0) return;

    const unsubscribe = videoProgress.on('change', (progress) => {
      const targetTime = progress * duration;
      const diff = Math.abs(video.currentTime - targetTime);
      
      if (diff > 0.5) {
        video.currentTime = targetTime;
      }
      
      if (!isPlaying && progress > 0) {
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    });

    return unsubscribe;
  }, [videoProgress, isReady, duration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: 'scale(1.1)',
          filter: 'brightness(0.6) contrast(1.1) saturate(1.2)',
        }}
        muted
        loop
        playsInline
        preload="auto"
        poster="/bg.png"
        initial={{ opacity: 0 }}
        animate={{ opacity: isReady ? 1 : 0 }}
        transition={{ duration: 2, ease: [0.4, 0, 0.2, 1] }}
      >
        <source src="/bg.mp4" type="video/mp4" />
        <source src="/bg.webm" type="video/webm" />
      </motion.video>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.08)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(20,10,30,0.3)_0%,_transparent_50%,_rgba(10,5,20,0.4)_100%)]" />
    </div>
  );
}