'use client';

import { memo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';

interface ConversationListProps {
  searchQuery?: string;
}

const ConversationList = memo(function ConversationList({ searchQuery = '' }: ConversationListProps) {
  const { conversations, getUser, currentUser } = useApp();

  const getOtherUser = (conv: typeof conversations[0]) => {
    if (conv.isGroup) return null;
    const otherId = conv.participants.find((p) => p !== currentUser?.id);
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
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const formatLastSeen = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const sortedConversations = [...conversations]
    .filter((conv) => {
      if (!searchQuery.trim()) return true;
      if (conv.isGroup) {
        return conv.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      const otherUser = getOtherUser(conv);
      if (!otherUser) return false;
      return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
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
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">💌</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">还没有对话</h3>
          <p className="text-sm text-slate-500 max-w-[240px]">
            去匹配页面找到你心仪的人，开始一段美好的对话吧
          </p>
        </motion.div>
      ) : (
        sortedConversations.map((conv, index) => {
          const isGroup = conv.isGroup;
          const otherUser = getOtherUser(conv);

          if (isGroup) {
            const lastMsg = conv.lastMessage;
            const preview = lastMsg
              ? lastMsg.senderId === currentUser?.id
                ? `你: ${lastMsg.text}`
                : lastMsg.text
              : '群聊已创建';

            return (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/chat/${conv.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100/60 transition-colors rounded-xl"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl">
                      👥
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-violet-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-[7px] text-white font-bold">AI</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-slate-800 truncate">
                        {conv.groupName || '未命名群聊'}
                      </h3>
                      {lastMsg && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {formatTime(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 truncate flex-1">{preview}</p>
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-medium flex items-center justify-center px-1"
                        >
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </motion.span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400/60 mt-0.5">
                      {conv.participants.length} 位成员
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          }

          if (!otherUser) return null;

          const lastMsg = conv.lastMessage;
          const preview = lastMsg
            ? lastMsg.senderId === 'current' || lastMsg.senderId === currentUser?.id
              ? `你: ${lastMsg.text}`
              : lastMsg.text
            : '开始对话...';

          const unreadCount = conv.unreadCount || 0;

          return (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={`/chat/${conv.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100/60 transition-colors rounded-xl"
              >
                <div className="relative">
                  <Avatar src={otherUser.avatar} alt={otherUser.name} size="md" />
                  {otherUser.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-medium text-slate-800 truncate">
                      {otherUser.name}
                    </h3>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {formatTime(lastMsg.timestamp)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-slate-500 truncate flex-1">{preview}</p>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] font-medium flex items-center justify-center px-1"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </div>
                  {!otherUser.isOnline && otherUser.lastSeen && (
                    <p className="text-[10px] text-slate-400/60 mt-0.5">
                      {formatLastSeen(otherUser.lastSeen)}在线
                    </p>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })
      )}
    </div>
  );
});

export default ConversationList;
