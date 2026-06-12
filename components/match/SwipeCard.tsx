'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { User } from '@/lib/types';
import InterestTags from '@/components/profile/InterestTags';

interface SwipeCardProps {
  user: User;
  isTop: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
}

export default function SwipeCard({ user, isTop, onSwipe, style }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      onSwipe('left');
    }
  }

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, ...style }}
      initial={isTop ? { scale: 1, opacity: 1 } : { scale: 0.95, opacity: 0.7 }}
      animate={
        isTop
          ? { scale: 1, opacity: 1 }
          : { scale: 0.95 - (style?.zIndex === 1 ? 0 : 0.05), opacity: 0.7 }
      }
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="absolute w-full bg-cream-50 rounded-card shadow-lg overflow-hidden cursor-grab active:cursor-grabbing touch-none select-none"
    >
      <div className="relative h-[420px] overflow-hidden">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full object-cover"
        />

        {isTop && (
          <>
            <motion.div
              style={{ opacity: likeOpacity }}
              className="absolute top-8 left-6 px-4 py-2 border-4 border-green-400 rounded-lg text-green-400 font-bold text-2xl rotate-[-15deg] pointer-events-none"
            >
              LIKE
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-8 right-6 px-4 py-2 border-4 border-red-400 rounded-lg text-red-400 font-bold text-2xl rotate-[15deg] pointer-events-none"
            >
              NOPE
            </motion.div>
          </>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 pt-16">
          <h3 className="text-xl font-semibold text-white mb-0.5">
            {user.name}, {user.age}
          </h3>
          <p className="text-sm text-white/80 mb-2">{user.city}</p>
          <p className="text-xs text-white/70 line-clamp-2 mb-3">{user.bio}</p>
          <InterestTags interests={user.interests} />
        </div>
      </div>
    </motion.div>
  );
}
