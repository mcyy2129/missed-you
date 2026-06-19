'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';
import ArtisticVideoBackground from '@/components/artistic/ArtisticVideoBackground';
import ArtisticForeground from '@/components/artistic/ArtisticForeground';
import ArtisticNavigation from '@/components/artistic/ArtisticNavigation';
import ArtisticScrollIndicator from '@/components/artistic/ArtisticScrollIndicator';
import { Sparkles, Moon, Sun, Star, Cloud, Leaf, Heart, Music, Feather, Butterfly } from 'lucide-react';

const artisticIcons = [Sparkles, Moon, Sun, Star, Cloud, Leaf, Heart, Music, Feather, Butterfly];

export default function ArtisticPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ['start start', 'end end'],
  });

  const scrollProgress = useMotionValue(0);
  const videoProgress = useTransform(scrollProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      scrollProgress.set(latest);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" ref={mainRef}>
      <ArtisticVideoBackground videoProgress={videoProgress} />
      
      <motion.div
        className="relative z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
      >
        <ArtisticNavigation scrollProgress={scrollProgress} />
        
        <ArtisticForeground 
          scrollProgress={scrollProgress} 
          videoProgress={videoProgress}
          artisticIcons={artisticIcons}
        />
        
        <ArtisticScrollIndicator scrollProgress={scrollProgress} />
      </motion.div>

      <style jsx global>{`
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-10px) rotate(2deg); }
          50% { transform: translateY(-5px) rotate(-1deg); }
          75% { transform: translateY(-15px) rotate(1deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        .artistic-gradient-text {
          background: linear-gradient(
            135deg,
            #fef3c7 0%,
            #fde68a 20%,
            #fcd34d 40%,
            #fbbf24 60%,
            #f59e0b 80%,
            #d97706 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s ease-in-out infinite;
        }
        
        .dreamy-glow {
          box-shadow: 
            0 0 20px rgba(251, 191, 36, 0.3),
            0 0 40px rgba(245, 158, 11, 0.2),
            0 0 80px rgba(217, 119, 6, 0.1);
        }
        
        .fairy-dust {
          position: absolute;
          width: 4px;
          height: 4px;
          background: radial-gradient(circle, #fef3c7 0%, #fcd34d 50%, transparent 100%);
          border-radius: 50%;
          pointer-events: none;
          animation: float-gentle 8s ease-in-out infinite;
        }
        
        .scroll-snap-container {
          scroll-snap-type: y mandatory;
        }
        
        .scroll-snap-section {
          scroll-snap-align: start;
          scroll-snap-stop: always;
        }
      `}</style>
    </div>
  );
}