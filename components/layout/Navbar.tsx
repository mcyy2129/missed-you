'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { useMusic } from '@/components/blog/MusicProvider';
import Avatar from '@/components/ui/Avatar';
import { useState, useEffect, memo } from 'react';

const BLOG_URL = '/blog';

const navLinks = [
  { href: '/', label: '发现' },
  { href: '/match', label: '匹配' },
  { href: '/chat', label: '消息' },
];

const Navbar = memo(function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useApp();
  const { isPlaying, currentSong } = useMusic();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav navbar-enter">
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
                className="relative text-sm font-medium transition-all duration-200 py-1"
                style={{ color: isActive ? '#84cc16' : 'rgba(255,255,255,0.5)' }}
              >
                {label}
                {isActive && (
                  <div
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: '#84cc16', boxShadow: '0 0 10px rgba(132, 204, 22, 0.5)' }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link href={BLOG_URL} className="relative">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full active:scale-110 transition-transform ${isPlaying ? 'animate-spin-slow' : ''}`}
              style={{ background: 'rgba(132, 204, 22, 0.15)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            {isMounted && isPlaying && (
              <div
                className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full pulse-dot"
                style={{ background: '#84cc16', boxShadow: '0 0 8px rgba(132, 204, 22, 0.6)' }}
              />
            )}
          </Link>

          {currentUser && (
            <Link href="/profile" className="active:scale-95 transition-transform">
              <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
});

export default Navbar;
