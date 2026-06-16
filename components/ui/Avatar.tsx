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

const fallbackColors = [
  'from-lime-500/20 to-emerald-500/15',
  'from-cyan-500/20 to-blue-500/15',
  'from-violet-500/20 to-purple-500/15',
  'from-rose-500/20 to-pink-500/15',
  'from-amber-500/20 to-orange-500/15',
  'from-teal-500/20 to-green-500/15',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

function FallbackAvatar({ alt, text, gradient }: { alt: string; text: string; gradient: string }) {
  return (
    <div className={`w-full h-full rounded-full flex items-center justify-center backdrop-blur-md`}
      style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <span className={`${text} text-white/40 font-medium`}>{alt[0] || '?'}</span>
    </div>
  );
}

export default function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  const { dimensions, text } = sizeMap[size];
  const fallbackGradient = getColorForName(alt);
  const hasValidSrc = src && src.trim() !== '' && !src.includes('undefined');

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative inline-flex items-center justify-center rounded-full ${dimensions} ${className}`}
      style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
    >
      {hasValidSrc ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.dataset.fallback) {
              target.dataset.fallback = '1';
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const div = document.createElement('div');
                div.className = 'w-full h-full rounded-full flex items-center justify-center backdrop-blur-md';
                div.style.background = 'rgba(255, 255, 255, 0.04)';
                div.style.border = '1px solid rgba(255, 255, 255, 0.08)';
                div.innerHTML = `<span class="${text} text-white/40 font-medium">${alt[0] || '?'}</span>`;
                parent.appendChild(div);
              }
            }
          }}
        />
      ) : (
        <FallbackAvatar alt={alt} text={text} gradient={fallbackGradient} />
      )}
    </motion.div>
  );
}
