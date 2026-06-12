'use client';

import { motion } from 'framer-motion';

interface InterestTagsProps {
  interests: string[];
  selected?: string[];
  onToggle?: (interest: string) => void;
}

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

export default function InterestTags({ interests, selected = [], onToggle }: InterestTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {interests.map((tag) => {
        const isSelected = selected.includes(tag);
        return (
          <motion.span
            key={tag}
            variants={item}
            whileHover={onToggle ? { scale: 1.05 } : undefined}
            whileTap={onToggle ? { scale: 0.95 } : undefined}
            onClick={() => onToggle?.(tag)}
            className={`inline-block px-3 py-1 text-xs rounded-full font-medium transition-colors cursor-default ${
              onToggle ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'bg-bronze-300 text-white'
                : 'bg-cream-100 text-brown-600'
            }`}
          >
            {tag}
          </motion.span>
        );
      })}
    </div>
  );
}
