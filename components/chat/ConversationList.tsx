'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';

export default function ConversationList() {
  const { conversations, getUser, currentUser } = useApp();

  const getOtherUser = (conv: typeof conversations[0]) => {
    const otherId = conv.participants.find((p) => p !== 'current');
    return otherId ? getUser(otherId) : undefined;
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    const aTime = a.lastMessage?.timestamp ?? 0;
    const bTime = b.lastMessage?.timestamp ?? 0;
    return bTime - aTime;
  });

  if (!currentUser) return null;

  return (
    <div className="flex flex-col">
      {sortedConversations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="text-5xl mb-4">💌</div>
          <h3 className="font-display text-lg text-brown-800 mb-2">还没有对话</h3>
          <p className="text-sm text-bronze-500 max-w-[240px]">
            去匹配页面找到你心仪的人，开始一段美好的对话吧
          </p>
        </motion.div>
      ) : (
        sortedConversations.map((conv, index) => {
          const otherUser = getOtherUser(conv);
          if (!otherUser) return null;

          const lastMsg = conv.lastMessage;
          const preview = lastMsg
            ? lastMsg.senderId === 'current'
              ? `你: ${lastMsg.text}`
              : lastMsg.text
            : '开始对话...';

          return (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/chat/${conv.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-cream-100/60 transition-colors rounded-card"
              >
                <Avatar src={otherUser.avatar} alt={otherUser.name} size="md" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-brown-800 truncate">
                      {otherUser.name}
                    </h3>
                    {lastMsg && (
                      <span className="text-[10px] text-bronze-500 shrink-0">
                        {formatTime(lastMsg.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-bronze-500 truncate mt-0.5">{preview}</p>
                </div>
              </Link>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
