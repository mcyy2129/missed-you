'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import ConversationList from '@/components/chat/ConversationList';
import { useApp } from '@/lib/store';

export default function ChatListPage() {
  const router = useRouter();
  const { currentUser, setConversations } = useApp();

  useEffect(() => {
    if (!currentUser) return;

    const refreshConversations = async () => {
      try {
        const convsRes = await fetch(`/api/conversations?userId=${currentUser.id}`);
        if (!convsRes.ok) return;
        const allConvs = await convsRes.json();

        const convsWithMessages = await Promise.all(
          allConvs.map(async (c: any) => {
            let messages: any[] = [];
            try {
              const msgRes = await fetch(`/api/messages?conversationId=${c.id}`);
              if (msgRes.ok) {
                messages = await msgRes.json();
              }
            } catch (e) {}

            return {
              id: c.id,
              participants: c.participants,
              messages: messages.map((m: any) => ({
                id: m.id,
                senderId: m.senderId,
                text: m.text,
                timestamp: m.timestamp,
                image: m.image || undefined,
                audio: m.audio || undefined,
                isRead: m.isRead,
              })),
              lastMessage: c.lastMessage ? {
                id: c.lastMessage.id,
                senderId: c.lastMessage.senderId,
                text: c.lastMessage.text,
                timestamp: c.lastMessage.timestamp,
              } : undefined,
              unreadCount: 0,
            };
          })
        );

        setConversations(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const newConvs = convsWithMessages.filter(c => !existingIds.has(c.id));
          if (newConvs.length === 0) return prev;
          return [...prev, ...newConvs];
        });
      } catch (e) {
        console.error('Failed to refresh conversations:', e);
      }
    };

    refreshConversations();
    const interval = setInterval(refreshConversations, 10000);
    return () => clearInterval(interval);
  }, [currentUser, setConversations]);

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
