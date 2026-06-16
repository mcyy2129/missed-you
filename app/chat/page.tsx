'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import ConversationList from '@/components/chat/ConversationList';
import { useApp } from '@/lib/store';

export default function ChatListPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-semibold text-white mb-1">
              消息
            </h1>
            <p className="text-sm text-white/50">你的心动对话</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/search')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-white/60 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>添加好友</span>
          </motion.button>
        </div>

        {currentUser ? (
          <ConversationList />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-white/50">请先登录</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
