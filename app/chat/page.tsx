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
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-semibold text-brown-800 mb-1">
              消息
            </h1>
            <p className="text-sm text-bronze-500">你的心动对话</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/search')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
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
            <p className="text-sm text-bronze-500">请先登录</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
