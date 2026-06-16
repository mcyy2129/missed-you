'use client';

import { useState, useCallback } from 'react';
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
  const [lastAction, setLastAction] = useState<'like' | 'nope' | 'super' | null>(null);

  const remainingUsers = users.filter(
    (u) => !likedUsers.has(u.id) && !matchedUsers.has(u.id)
  );
  const visibleCards = remainingUsers.slice(currentIndex, currentIndex + 3);

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    const user = remainingUsers[currentIndex];
    if (!user) return;

    setLastAction(direction === 'right' ? 'like' : 'nope');
    const isMatch = await swipeUser(user.id, direction);
    setCurrentIndex((prev) => prev + 1);

    if (isMatch) {
      onMatch?.(user);
    }

    setTimeout(() => setLastAction(null), 500);
  }, [remainingUsers, currentIndex, swipeUser, onMatch]);

  const handleSuperLike = useCallback(async () => {
    const user = remainingUsers[currentIndex];
    if (!user) return;

    setLastAction('super');
    const isMatch = await swipeUser(user.id, 'right');
    setCurrentIndex((prev) => prev + 1);

    if (isMatch) {
      onMatch?.(user);
    }

    setTimeout(() => setLastAction(null), 500);
  }, [remainingUsers, currentIndex, swipeUser, onMatch]);

  if (visibleCards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl mb-6"
        >
          ✨
        </motion.div>
        <h3 className="text-lg font-display font-semibold text-brown-800 mb-2">
          今天的故事就到这里
        </h3>
        <p className="text-sm text-bronze-500 mb-6">
          明天还有更多新朋友等你发现
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentIndex(0)}
          className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-md shadow-rose-200"
        >
          重新开始
        </motion.button>
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

      <AnimatePresence>
        {lastAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            {lastAction === 'like' && (
              <div className="text-6xl">❤️</div>
            )}
            {lastAction === 'nope' && (
              <div className="text-6xl">👋</div>
            )}
            {lastAction === 'super' && (
              <div className="text-6xl">⭐</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {visibleCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-20 left-0 right-0 flex items-center justify-center gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-xl border border-slate-100 hover:border-red-200 transition-colors"
          >
            ✕
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSuperLike}
            className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-lg border border-slate-100 hover:border-blue-200 transition-colors text-blue-400"
          >
            ⭐
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.15, y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center text-xl border border-slate-100 hover:border-rose-200 transition-colors text-rose-400"
          >
            ♥
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
