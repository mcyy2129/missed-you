'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  showLogo?: boolean;
  rightAction?: React.ReactNode;
}

export default function MobileHeader({ 
  title, 
  showBack = false, 
  showLogo = true,
  rightAction 
}: MobileHeaderProps) {
  const router = useRouter();
  const { getTotalUnread } = useApp();
  const totalUnread = getTotalUnread();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-white/10/60 safe-area-top"
    >
      <div className="mx-auto max-w-lg flex items-center justify-between px-4 h-12">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1 text-white/60 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {showLogo && !title && (
            <h1 className="text-lg font-semibold text-white">Missed You</h1>
          )}
          {title && (
            <h1 className="text-base font-medium text-white truncate">{title}</h1>
          )}
        </div>
        
        {rightAction && (
          <div className="flex items-center gap-2">
            {rightAction}
          </div>
        )}
      </div>
    </motion.header>
  );
}
