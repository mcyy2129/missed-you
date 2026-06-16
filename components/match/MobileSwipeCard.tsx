'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { User } from '@/lib/types';

interface MobileSwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
}

export default function MobileSwipeCard({ user, onSwipe, style }: MobileSwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 500) {
      onSwipe('right');
    } else if (info.offset.x < -threshold || info.velocity.x < -500) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, ...style }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      className="absolute w-full cursor-grab active:cursor-grabbing"
    >
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100">
        <div className="relative h-[420px]">
          <img
            src={user.avatar || user.photos?.[0]}
            alt={user.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-8 left-6 px-4 py-2 border-4 border-emerald-400 rounded-lg rotate-[-20deg]"
          >
            <span className="text-3xl font-bold text-emerald-400">LIKE</span>
          </motion.div>
          
          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-8 right-6 px-4 py-2 border-4 border-red-400 rounded-lg rotate-[20deg]"
          >
            <span className="text-3xl font-bold text-red-400">NOPE</span>
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <span className="text-xl text-white/80">{user.age}</span>
              {user.isOnline && (
                <span className="px-2 py-0.5 bg-emerald-400 text-white text-xs font-medium rounded-full">
                  在线
                </span>
              )}
            </div>
            <p className="text-sm text-white/90 flex items-center gap-1 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.city}
            </p>
            <p className="text-sm text-white/80 line-clamp-2">{user.bio}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
