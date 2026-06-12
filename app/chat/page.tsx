'use client';

import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import ConversationList from '@/components/chat/ConversationList';
import { useApp } from '@/lib/store';

export default function ChatListPage() {
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 pt-20 pb-28">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-semibold text-brown-800 mb-1">
            消息
          </h1>
          <p className="text-sm text-bronze-500">你的心动对话</p>
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
