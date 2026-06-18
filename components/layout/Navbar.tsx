'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import { useMusic } from '@/components/blog/MusicProvider';
import Avatar from '@/components/ui/Avatar';
import { useState, useEffect } from 'react';

const BLOG_URL = '/blog';

const navLinks = [
  { href: '/', label: '发现' },
  { href: '/match', label: '匹配' },
  { href: '/chat', label: '消息' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const { isPlaying, currentSong } = useMusic();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-nav"
    >
      <nav className="mx-auto max-w-lg flex items-center justify-between px-5 h-14">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight" style={{ color: '#84cc16', textShadow: '0 0 20px rgba(132, 204, 22, 0.3)' }}>
          Missed You
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative text-sm font-medium transition-all duration-300 py-1"
                style={{ color: isActive ? '#84cc16' : 'rgba(255,255,255,0.5)' }}
              >
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: '#84cc16', boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link href={BLOG_URL} className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              whileHover={{ scale: 1.2 }}
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{ background: 'rgba(132, 204, 22, 0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </motion.div>
            {/* Playing indicator dot */}
            {isMounted && isPlaying && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: '#84cc16', boxShadow: '0 0 8px rgba(132, 204, 22, 0.6)' }}
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full"
                  style={{ background: '#84cc16' }}
                />
              </motion.div>
            )}
          </Link>

          {currentUser && (
            <Link href="/profile">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
              </motion.div>
            </Link>
          )}
        </div>
      </nav>
    </motion.header>
  );
}
