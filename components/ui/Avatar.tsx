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
  'from-lime-600/40 to-emerald-600/40',
  'from-cyan-600/40 to-blue-600/40',
  'from-violet-600/40 to-purple-600/40',
  'from-rose-600/40 to-pink-600/40',
  'from-amber-600/40 to-orange-600/40',
  'from-teal-600/40 to-green-600/40',
];

function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length];
}

export default function Avatar({ src, alt = '', size = 'md', className = '' }: AvatarProps) {
  const { dimensions, text } = sizeMap[size];
  const fallbackGradient = getColorForName(alt);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative inline-flex items-center justify-center rounded-full ring-1 ring-white/10 ${dimensions} ${className}`}
    >
      {src ? (
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
                div.className = `w-full h-full rounded-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center backdrop-blur-sm`;
                div.innerHTML = `<span class="${text} text-white/80 font-medium">${alt[0] || '?'}</span>`;
                parent.appendChild(div);
              }
            }
          }}
        />
      ) : (
        <div className={`w-full h-full rounded-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center backdrop-blur-sm`}>
          <span className={`${text} text-white/80 font-medium`}>{alt[0] || '?'}</span>
        </div>
      )}
    </motion.div>
  );
}
