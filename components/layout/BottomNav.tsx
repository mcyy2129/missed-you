'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const tabs = [
  { href: '/', label: '发现', icon: '🏠' },
  { href: '/match', label: '匹配', icon: '💫' },
  { href: '/messages', label: '消息', icon: '💬' },
  { href: '/profile', label: '我的', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-cream-50/80 backdrop-blur-md border-t border-cream-200/50"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-3"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav"
                  className="absolute inset-x-1 -top-0.5 h-0.5 rounded-full bg-bronze-400"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="text-lg leading-none">{icon}</span>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-brown-800' : 'text-brown-600'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
