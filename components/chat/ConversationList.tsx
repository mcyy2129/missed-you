'use client';

import { memo, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';

interface ConversationListProps {
  searchQuery?: string;
}

const ConversationList = memo(function ConversationList({ searchQuery = '' }: ConversationListProps) {
  const { conversations, getUser, currentUser, setConversations } = useApp();
  const [deletingConv, setDeletingConv] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [pressingConv, setPressingConv] = useState<string | null>(null);

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

  const handleLongPressStart = useCallback((convId: string) => {
    setPressingConv(convId);
    longPressTimer.current = setTimeout(() => {
      setDeletingConv(convId);
      setPressingConv(null);
    }, 600);
  }, []);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setPressingConv(null);
  }, []);

  const handleDeleteConversation = useCallback((convId: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== convId);
      try {
        localStorage.setItem('conversations', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setDeletingConv(null);
  }, [setConversations]);

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
    <>
      <div className="flex flex-col">
        {sortedConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">💌</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">还没有对话</h3>
            <p className="text-sm text-white/50 max-w-[240px]">
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
                  className={`relative overflow-hidden rounded-xl transition-all ${pressingConv === conv.id ? 'long-press-active' : ''}`}
                  onMouseDown={() => handleLongPressStart(conv.id)}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={() => handleLongPressStart(conv.id)}
                  onTouchEnd={handleLongPressEnd}
                >
                  <div className="long-press-indicator" />
                  <Link
                    href={`/chat/${conv.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors rounded-xl"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-600/30 to-cyan-600/30 flex items-center justify-center text-white text-xl backdrop-blur-sm border border-white/10">
                        👥
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-violet-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-[7px] text-white font-bold">AI</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-white truncate">
                          {conv.groupName || '未命名群聊'}
                        </h3>
                        {lastMsg && (
                          <span className="text-[10px] text-white/40 shrink-0">
                            {formatTime(lastMsg.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-white/50 truncate flex-1">{preview}</p>
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
                      <p className="text-[10px] text-white/30 mt-0.5">
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
                className={`relative overflow-hidden rounded-xl transition-all ${pressingConv === conv.id ? 'long-press-active' : ''}`}
                onMouseDown={() => handleLongPressStart(conv.id)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(conv.id)}
                onTouchEnd={handleLongPressEnd}
              >
                <div className="long-press-indicator" />
                <Link
                  href={`/chat/${conv.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors rounded-xl"
                >
                  <div className="relative">
                    <Avatar src={otherUser.avatar} alt={otherUser.name} size="md" />
                    {otherUser.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-white truncate">
                        {otherUser.name}
                      </h3>
                      {lastMsg && (
                        <span className="text-[10px] text-white/40 shrink-0">
                          {formatTime(lastMsg.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-white/50 truncate flex-1">{preview}</p>
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
                      <p className="text-[10px] text-white/30 mt-0.5">
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

      <AnimatePresence>
        {deletingConv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setDeletingConv(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-5 w-full max-w-xs shadow-xl"
              style={{ background: 'rgba(20, 20, 24, 0.97)', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">删除对话</h3>
                <p className="text-sm text-white/50 mt-1">确定要删除这个对话吗？聊天记录将被清除。</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingConv(null)}
                  className="flex-1 px-4 py-2.5 bg-white/5 text-white/70 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors border border-white/10"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDeleteConversation(deletingConv)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default ConversationList;
