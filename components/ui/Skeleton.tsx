'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height 
}: SkeletonProps) {
  const baseClasses = 'bg-white/8 animate-pulse';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-white/8">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={56} height={56} />
        <div className="flex-1">
          <Skeleton width="40%" height={16} className="mb-2" />
          <Skeleton width="60%" height={12} />
        </div>
      </div>
      <Skeleton variant="rectangular" className="mt-4 h-32" />
    </div>
  );
}

export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <Skeleton width="35%" height={14} />
          <Skeleton width="15%" height={10} />
        </div>
        <Skeleton width="70%" height={12} />
      </div>
    </div>
  );
}
