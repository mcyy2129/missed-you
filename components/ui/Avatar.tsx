'use client';

import { motion } from 'framer-motion';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { dimensions: string; text: string }> = {
  sm: { dimensions: 'w-8 h-8', text: 'text-xs' },
  md: { dimensions: 'w-12 h-12', text: 'text-sm' },
  lg: { dimensions: 'w-16 h-16', text: 'text-base' },
  xl: { dimensions: 'w-24 h-24', text: 'text-lg' },
};

export default function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  const { dimensions, text } = sizeMap[size];

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative inline-flex items-center justify-center rounded-full ring-2 ring-bronze-300/20 ring-offset-2 ring-offset-cream-50 ${dimensions} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
          <span className={`${text} text-white font-medium`}>{alt[0] || '?'}</span>
        </div>
      )}
    </motion.div>
  );
}
