'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Avatar from '@/components/ui/Avatar';

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: any;
  messageCount: number;
  created_at: number;
  updated_at: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  image: string | null;
  audio: string | null;
  is_read: number;
  created_at: number;
  sender_name: string;
  sender_avatar: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
}

export default function AdminConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [convRes, usersRes] = await Promise.all([
        fetch('/api/admin/conversations'),
        fetch('/api/admin/users'),
      ]);
      const convData = await convRes.json();
      const usersData = await usersRes.json();
      setConversations(convData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/messages?conversationId=${conversationId}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || '未知用户';
  };

  const getUserAvatar = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.avatar || '';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-white/50">加载中...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      
      <main className="mx-auto max-w-6xl px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="text-sm text-white/50 hover:text-white/60 mb-2"
            >
              ← 返回管理后台
            </button>
            <h1 className="text-2xl font-display font-semibold text-white">
              对话管理
            </h1>
            <p className="text-sm text-white/50 mt-1">
              共 {conversations.length} 个对话
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1 bg-transparent rounded-card shadow-md overflow-hidden">
              <div className="p-4 border-b border-white/8">
                <h3 className="font-medium text-white">对话列表</h3>
              </div>
              <div className="divide-y divide-cream-100 max-h-[600px] overflow-y-auto">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleConversationClick(conv.id)}
                    className={`w-full p-4 text-left hover:bg-white/5/50 transition-colors ${
                      selectedConversation === conv.id ? 'bg-white/5/70' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {conv.participants.slice(0, 2).map((userId, idx) => (
                          <div key={userId} className="relative">
                            <Avatar src={getUserAvatar(userId)} alt={getUserName(userId)} size="sm" />
                          </div>
                        ))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {conv.participants.map(id => getUserName(id)).join(' & ')}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {conv.lastMessage?.text || '暂无消息'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-white/40">{conv.messageCount}条</p>
                        <p className="text-[10px] text-white/40">{formatDate(conv.updated_at)}</p>
                      </div>
                    </div>
                  </button>
                ))}

                {conversations.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-sm text-white/50">暂无对话</p>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Panel */}
            <div className="lg:col-span-2 bg-transparent rounded-card shadow-md overflow-hidden">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-white/8">
                    <h3 className="font-medium text-white">消息记录</h3>
                  </div>
                  <div className="p-4 max-h-[600px] overflow-y-auto">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-white/50">加载消息中...</p>
                      </div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${
                              msg.sender_id === 'ai' ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <Avatar src={msg.sender_avatar} alt={msg.sender_name} size="sm" />
                            <div className={`max-w-[70%] ${msg.sender_id === 'ai' ? 'text-right' : ''}`}>
                              <p className="text-xs text-white/50 mb-1">{msg.sender_name}</p>
                              <div className={`inline-block px-3 py-2 rounded-2xl ${
                                msg.sender_id === 'ai'
                                  ? 'bg-bronze-300 text-white'
                                  : 'bg-white/5 text-white border border-white/10/60'
                              }`}>
                                {msg.text && <p className="text-sm">{msg.text}</p>}
                                {msg.image && (
                                  <img src={msg.image} alt="图片" className="mt-2 max-w-[200px] rounded-lg" />
                                )}
                                {msg.audio && (
                                  <p className="text-xs text-white/50 mt-1">[语音消息]</p>
                                )}
                              </div>
                              <p className="text-[10px] text-white/40 mt-1">
                                {formatDate(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-white/50">暂无消息</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[600px]">
                  <div className="text-center">
                    <span className="text-4xl mb-4 block">💬</span>
                    <p className="text-sm text-white/50">选择一个对话查看详情</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
