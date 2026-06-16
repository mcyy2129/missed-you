'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';

const navLinks = [
  { href: '/', label: '发现' },
  { href: '/match', label: '匹配' },
  { href: '/chat', label: '消息' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser } = useApp();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-cream-200/50"
    >
      <nav className="mx-auto max-w-lg flex items-center justify-between px-5 h-14">
        <Link href="/" className="font-display text-xl font-semibold text-brown-800 tracking-tight">
          Missed You
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative text-sm font-medium text-brown-700 hover:text-brown-800 transition-colors py-1"
              >
                {label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-bronze-400"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {currentUser && (
          <Link href="/profile">
            <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
          </Link>
        )}
      </nav>
    </motion.header>
  );
}
