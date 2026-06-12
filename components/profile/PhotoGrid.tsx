'use client';

import { motion } from 'framer-motion';

interface PhotoGridProps {
  photos: string[];
  editable?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export default function PhotoGrid({ photos, editable = false }: PhotoGridProps) {
  const slots = Array.from({ length: 6 }, (_, i) => photos[i] || null);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-2"
    >
      {slots.map((photo, i) => (
        <motion.div
          key={i}
          variants={item}
          className={`aspect-square rounded-card overflow-hidden ${
            photo
              ? ''
              : 'bg-cream-100 border-2 border-dashed border-cream-200 flex items-center justify-center'
          }`}
        >
          {photo ? (
            <img
              src={photo}
              alt={`照片 ${i + 1}`}
              className="w-full h-full object-cover"
            />
          ) : editable ? (
            <span className="text-2xl text-cream-200">+</span>
          ) : null}
        </motion.div>
      ))}
    </motion.div>
  );
}
