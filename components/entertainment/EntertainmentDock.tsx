'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

interface EntertainmentDockProps {
  items: DockItem[];
}

function DockItemComponent({
  item,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
}: {
  item: DockItem;
  mouseX: any;
  spring: any;
  distance: number;
  magnification: number;
  baseItemSize: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{ width: size, height: size }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={item.onClick}
      className="dock-item"
      tabIndex={0}
      role="button"
    >
      <div className={`dock-icon ${item.active ? 'dock-icon-active' : ''}`}>
        {item.icon}
      </div>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          className="dock-label"
        >
          {item.label}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function EntertainmentDock({ items }: EntertainmentDockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <div className="entertainment-dock-outer">
      <motion.div
        onMouseMove={({ pageX }) => mouseX.set(pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="entertainment-dock-panel"
      >
        {items.map((item, index) => (
          <DockItemComponent
            key={index}
            item={item}
            mouseX={mouseX}
            spring={{ mass: 0.1, stiffness: 150, damping: 12 }}
            distance={200}
            magnification={64}
            baseItemSize={44}
          />
        ))}
      </motion.div>
    </div>
  );
}
