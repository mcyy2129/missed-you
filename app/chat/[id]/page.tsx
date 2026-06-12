'use client';

import { useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';

export default function ChatWindowPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { conversations, getUser, sendMessage } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === id);

  const otherUser = useMemo(() => {
    if (!conversation) return undefined;
    const otherId = conversation.participants.find((p) => p !== 'current');
    return otherId ? getUser(otherId) : undefined;
  }, [conversation, getUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages.length]);

  const handleSend = (text: string) => {
    if (!conversation) return;
    sendMessage(conversation.id, text);
  };

  if (!conversation || !otherUser) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <p className="text-sm text-bronze-500">对话不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-cream-50/90 backdrop-blur-md border-b border-cream-200/50"
      >
        <div className="mx-auto max-w-lg flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.push('/chat')}
            className="text-brown-700 hover:text-brown-800 transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <Avatar src={otherUser.avatar} alt={otherUser.name} size="sm" />
          <span className="text-sm font-medium text-brown-800">{otherUser.name}</span>
        </div>
      </motion.header>

      <main className="flex-1 overflow-y-auto pt-16 pb-20 px-4 max-w-lg mx-auto w-full">
        <div className="flex flex-col gap-3 py-4">
          {conversation.messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-4xl mb-3">🌸</div>
              <p className="text-sm text-bronze-500">
                和{otherUser.name}开始对话吧
              </p>
            </motion.div>
          ) : (
            conversation.messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                text={msg.text}
                isMe={msg.senderId === 'current'}
                timestamp={msg.timestamp}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <ChatInput onSend={handleSend} />
    </div>
  );
}
