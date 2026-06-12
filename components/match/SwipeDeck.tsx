'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { User } from '@/lib/types';
import SwipeCard from './SwipeCard';

interface SwipeDeckProps {
  onMatch?: (user: User) => void;
}

export default function SwipeDeck({ onMatch }: SwipeDeckProps) {
  const { users, likedUsers, matchedUsers, swipeUser } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  const remainingUsers = users.filter(
    (u) => !likedUsers.has(u.id) && !matchedUsers.has(u.id)
  );
  const visibleCards = remainingUsers.slice(currentIndex, currentIndex + 3);

  function handleSwipe(direction: 'left' | 'right') {
    const user = remainingUsers[currentIndex];
    if (!user) return;

    const isMatch = swipeUser(user.id, direction);
    setCurrentIndex((prev) => prev + 1);

    if (isMatch) {
      onMatch?.(user);
    }
  }

  if (visibleCards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <p className="text-4xl mb-4">✨</p>
        <h3 className="text-lg font-display font-semibold text-brown-800 mb-2">
          今天的故事就到这里
        </h3>
        <p className="text-sm text-bronze-500">
          明天还有更多新朋友等你发现
        </p>
      </motion.div>
    );
  }

  return (
    <div className="relative w-full h-[420px] mx-auto">
      <AnimatePresence>
        {visibleCards.map((user, i) => (
          <SwipeCard
            key={user.id}
            user={user}
            isTop={i === 0}
            onSwipe={handleSwipe}
            style={{
              zIndex: visibleCards.length - i,
              top: i * 8,
            }}
          />
        ))}
      </AnimatePresence>

      {visibleCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-16 left-0 right-0 flex items-center justify-center gap-8"
        >
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-xl hover:scale-110 transition-transform active:scale-95"
          >
            ✕
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-xl hover:scale-110 transition-transform active:scale-95 text-yellow-400"
          >
            ⭐
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-xl hover:scale-110 transition-transform active:scale-95 text-rose-400"
          >
            ♥
          </button>
        </motion.div>
      )}
    </div>
  );
}
