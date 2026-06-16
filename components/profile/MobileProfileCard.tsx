'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/lib/types';
import InterestTags from '@/components/profile/InterestTags';

interface MobileProfileCardProps {
  user: User;
  onClick?: () => void;
  compact?: boolean;
}

const MobileProfileCard = memo(function MobileProfileCard({ 
  user, 
  onClick, 
  compact = false 
}: MobileProfileCardProps) {
  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
            />
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-slate-800 truncate">{user.name}</h3>
              <span className="text-xs text-slate-500">{user.age}</span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {user.city}
            </p>
            <p className="text-xs text-slate-600 line-clamp-1 mt-1">{user.bio}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50 transition-colors"
    >
      <div className="relative">
        <img 
          src={user.avatar || user.photos?.[0]} 
          alt={user.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{user.name}</h3>
            <span className="text-sm text-white/80">{user.age}</span>
            {user.isOnline && (
              <span className="px-1.5 py-0.5 bg-emerald-400 text-white text-[10px] font-medium rounded-full">在线</span>
            )}
          </div>
          <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {user.city}
          </p>
        </div>
      </div>
      
      <div className="p-3">
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-2">
          {user.bio}
        </p>
        <InterestTags interests={user.interests.slice(0, 4)} />
      </div>
    </motion.div>
  );
});

export default MobileProfileCard;
