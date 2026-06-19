'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import Avatar from '@/components/ui/Avatar';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import QuickReplies from '@/components/chat/QuickReplies';
import DateSeparator from '@/components/chat/DateSeparator';
import GroupSettingsModal from '@/components/chat/GroupSettingsModal';

const QUICK_REPLY_SUGGESTIONS: Record<string, string[]> = {
  default: ['你好呀~', '在吗？', '最近怎么样？', '有空聊聊吗？'],
  greeting: ['嗨！', '你好~', '好久不见！'],
  question: ['真的吗？', '然后呢？', '为什么呀？', '有意思！'],
  positive: ['太棒了！', '哈哈~', '好开心！', '爱你哟 ❤️'],
};

function getQuickReplies(messages: number): string[] {
  if (messages === 0) return QUICK_REPLY_SUGGESTIONS.greeting;
  if (messages % 3 === 0) return QUICK_REPLY_SUGGESTIONS.question;
  if (messages % 2 === 0) return QUICK_REPLY_SUGGESTIONS.positive;
  return QUICK_REPLY_SUGGESTIONS.default;
}

function shouldShowDateSeparator(current: number, previous?: number): boolean {
  if (!previous) return true;
  const currentDate = new Date(current).toDateString();
  const previousDate = new Date(previous).toDateString();
  return currentDate !== previousDate;
}

function formatLastSeen(timestamp?: number): string {
  if (!timestamp) return '离线';
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚在线';
  if (minutes < 60) return `${minutes}分钟前在线`;
  if (hours < 24) return `${hours}小时前在线`;
  if (days < 7) return `${days}天前在线`;
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '离线';
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) + '在线';
}

export default function ChatWindowPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { conversations, getUser, sendMessage, addAIMessage, addReaction, markAsRead, currentUser, setConversations, chatBackground } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAIReplying, setIsAIReplying] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [replyingAI, setReplyingAI] = useState<string | null>(null);
  const [pendingAIMessage, setPendingAIMessage] = useState<{ text: string; image?: string } | null>(null);

  const conversation = conversations.find((c) => c.id === id);

  const otherUser = useMemo(() => {
    if (!conversation || conversation.isGroup) return undefined;
    const otherId = conversation.participants.find((p) => p !== 'current' && p !== currentUser?.id);
    return otherId ? getUser(otherId) : undefined;
  }, [conversation, getUser, currentUser]);

  const groupMembers = useMemo(() => {
    if (!conversation?.isGroup) return [];
    return conversation.participants
      .map(id => getUser(id))
      .filter(Boolean);
  }, [conversation, getUser]);

  const aiMembers = useMemo(() => {
    if (!conversation?.isGroup) return [];
    return conversation.participants
      .filter(id => id.startsWith('ai-'))
      .map(id => getUser(id))
      .filter(Boolean);
  }, [conversation, getUser]);

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement?.parentElement;
    if (!container) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages.length]);

  useEffect(() => {
    if (conversation && id) {
      markAsRead(id);
    }
  }, [id]);

  useEffect(() => {
    if (!id || !currentUser) return;
    let isSyncing = false;

    const syncMessages = async () => {
      if (isSyncing) return;
      isSyncing = true;
      
      try {
        const params = new URLSearchParams({ conversationId: id });
        const res = await fetch(`/api/messages?${params}`);
        if (!res.ok) return;
        
        const serverMessages = await res.json();
        if (serverMessages.length === 0) return;

        setConversations((prev) => {
          const conv = prev.find(c => c.id === id);
          
          const newMessages = serverMessages
            .filter((m: any) => !conv || !conv.messages.some(msg => msg.id === m.id))
            .map((m: any) => ({
              id: m.id,
              senderId: m.senderId,
              text: m.text,
              timestamp: m.timestamp,
              image: m.image || undefined,
              audio: m.audio || undefined,
              isRead: m.isRead,
              readAt: m.readAt || undefined,
              status: m.isRead ? 'read' as const : 'sent' as const,
            }));

          if (newMessages.length === 0 && conv) {
            // Even if no new messages, update read status of existing ones
            let hasUpdates = false;
            const updatedMessages = conv.messages.map(m => {
              const serverMsg = serverMessages.find((sm: any) => sm.id === m.id);
              if (serverMsg && serverMsg.isRead && !m.isRead) {
                hasUpdates = true;
                return { ...m, isRead: true, readAt: serverMsg.readAt, status: 'read' as const };
              }
              return m;
            });
            if (hasUpdates) {
              return prev.map(c => c.id === id ? { ...c, messages: updatedMessages } : c);
            }
            return prev;
          }

          if (!conv) {
            const newConv = {
              id,
              participants: [currentUser?.id || '', ...serverMessages.map((m: any) => m.senderId).filter((s: string) => s !== currentUser?.id)],
              messages: newMessages,
              lastMessage: newMessages[newMessages.length - 1],
              unreadCount: 0,
            };
            const updated = [...prev, newConv];
            localStorage.setItem('conversations', JSON.stringify(updated));
            return updated;
          }

          const updated = prev.map(c =>
            c.id === id
              ? {
                  ...c,
                  messages: [...c.messages, ...newMessages],
                  lastMessage: newMessages[newMessages.length - 1],
                }
              : c
          );
          localStorage.setItem('conversations', JSON.stringify(updated));
          return updated;
        });
      } catch (error) {
        console.error('Failed to sync messages:', error);
      } finally {
        isSyncing = false;
      }
    };

    syncMessages();
    const interval = setInterval(syncMessages, 5000);

    return () => clearInterval(interval);
  }, [id, currentUser, setConversations]);

  const quickReplies = useMemo(() => {
    if (!conversation) return [];
    return getQuickReplies(conversation.messages.length);
  }, [conversation?.messages.length]);

  const getMentionedAI = useCallback((text: string): string | null => {
    if (!conversation?.isGroup || aiMembers.length === 0) return null;
    
    for (const ai of aiMembers) {
      const aiUser = ai as any;
      if (text.includes(`@${aiUser.name}`)) {
        return aiUser.id;
      }
    }
    return null;
  }, [conversation, aiMembers]);

  const getAIReply = useCallback(async (userText: string, userImage?: string, aiId?: string) => {
    if (!currentUser) return;
    
    let targetAI = aiId ? getUser(aiId) : otherUser;
    if (!targetAI) {
      targetAI = {
        id: aiId || 'ai',
        name: '助手',
        age: 25,
        city: '北京',
        avatar: '',
        bio: '',
        interests: [],
        photos: [],
        isOnline: true,
      };
    }
    
    setIsAIReplying(true);
    setReplyingAI(aiId || null);
    setShowQuickReplies(false);
    
    try {
      const history = (conversation?.messages || []).slice(-10).map((m) => ({
        role: m.senderId === 'current' || m.senderId === currentUser?.id ? 'user' as const : 'assistant' as const,
        content: m.text || (m.image ? '[图片]' : '') || (m.audio ? '[语音]' : '') || (m.sticker ? '[表情]' : ''),
      }));
      
      const userContent = userImage 
        ? `${userText ? userText + ' ' : ''}[图片]`
        : userText;
      
      const isAIPersona = targetAI.id.startsWith('ai-');
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: userContent }],
          userProfile: {
            name: targetAI.name,
            age: targetAI.age,
            city: targetAI.city,
            interests: targetAI.interests,
            bio: targetAI.bio,
          },
          personaId: isAIPersona ? targetAI.id : undefined,
        }),
      });
      const data = await res.json();
      setIsUsingFallback(data.isFallback);
      
      if (conversation) {
        const aiSenderId = aiId || otherUser?.id || 'ai';
        addAIMessage(conversation.id, data.reply || '嗯嗯~', aiSenderId);
      }
      
      setTimeout(() => {
        setShowQuickReplies(true);
        setReplyingAI(null);
      }, 500);
    } catch (error) {
      console.error('AI reply error:', error);
      const aiSenderId = aiId || otherUser?.id || 'ai';
      addAIMessage(conversation!.id, '抱歉，我现在有点忙~', aiSenderId);
      setShowQuickReplies(true);
      setReplyingAI(null);
    } finally {
      setIsAIReplying(false);
    }
  }, [currentUser, otherUser, conversation, addAIMessage, getUser]);

  const handleSend = (text: string, image?: string, audio?: string, sticker?: string) => {
    if (!conversation) return;
    if (!text && !image && !audio && !sticker) return;

    const isAIPersona = otherUser?.id.startsWith('ai-');
    const isGroupAI = conversation.isGroup && text && getMentionedAI(text);

    if (conversation.isGroup && text) {
      const mentionedAIId = getMentionedAI(text);
      sendMessage(conversation.id, text || '', image, audio, sticker, !!mentionedAIId);
      if (mentionedAIId) {
        const cleanText = text.replace(/@[\u4e00-\u9fa5a-zA-Z0-9]+/g, '').trim();
        setTimeout(() => {
          getAIReply(cleanText || text, image, mentionedAIId);
        }, 500);
      }
      return;
    }
    
    if (isAIPersona) {
      const followedAI = JSON.parse(localStorage.getItem('followedAI') || '[]');
      const isFollowed = followedAI.includes(otherUser?.id);
      
      if (!isFollowed) {
        const userMessages = conversation.messages.filter(m => m.senderId === currentUser?.id);
        if (userMessages.length >= 3) {
          setPendingAIMessage({ text, image });
          setShowFollowModal(true);
          return;
        }
      }

      sendMessage(conversation.id, text || '', image, audio, sticker, true);

      if (!audio && !sticker) {
        getAIReply(text, image);
      } else if (audio) {
        addAIMessage(conversation!.id, '[语音消息]', otherUser?.id);
      } else if (sticker) {
        const responses = ['😄', '😊', '🥰', '👍', '❤️'];
        setTimeout(() => {
          addAIMessage(conversation!.id, responses[Math.floor(Math.random() * responses.length)], otherUser?.id);
        }, 800);
      }
    } else {
      sendMessage(conversation.id, text || '', image, audio, sticker);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  const handleReact = (messageId: string, emoji: string) => {
    if (conversation) {
      addReaction(conversation.id, messageId, emoji);
    }
  };

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-white/50">对话不存在</p>
      </div>
    );
  }

  const isGroup = conversation.isGroup;
  const displayName = isGroup ? conversation.groupName : otherUser?.name;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={chatBackground ? {
        backgroundImage: `url(${chatBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      <header
        className="fixed top-0 left-0 right-0 z-50 glass-nav navbar-enter"
      >
        <div className="mx-auto max-w-lg flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.push('/chat')}
            className="text-white/60 hover:text-white transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <div 
            className="relative cursor-pointer"
            onClick={() => {
              if (isGroup) {
                setShowGroupSettings(true);
              } else if (otherUser) {
                router.push(`/user/${otherUser.id}`);
              }
            }}
          >
            {isGroup ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-600/30 to-cyan-600/30 flex items-center justify-center text-white text-lg hover:opacity-90 transition-opacity backdrop-blur-sm border border-white/10">
                👥
              </div>
            ) : (
              <>
                <Avatar src={otherUser?.avatar || ''} alt={otherUser?.name || ''} size="sm" />
                {otherUser?.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </>
            )}
          </div>

          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              if (!isGroup && otherUser) {
                router.push(`/user/${otherUser.id}`);
              }
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-white truncate hover:text-rose-500 transition-colors">{displayName}</span>
              {!isGroup && otherUser?.id.startsWith('ai-') && (
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-[8px] font-bold rounded-full">AI</span>
              )}
            </div>
            {isGroup ? (
              <span className="text-xs text-white/50 block">
                {groupMembers.length} 位成员 · {aiMembers.length} 个 AI
              </span>
            ) : (
              <>
                {isUsingFallback && (
                  <span className="text-xs text-white/40 block">智能回复模式</span>
                )}
                {otherUser?.isOnline && !isUsingFallback && (
                  <span className="text-xs text-emerald-500 block">在线</span>
                )}
                {!otherUser?.isOnline && !isUsingFallback && otherUser?.lastSeen && (
                  <span className="text-xs text-white/40 block">
                    {formatLastSeen(otherUser.lastSeen)}
                  </span>
                )}
                {!otherUser?.isOnline && !isUsingFallback && !otherUser?.lastSeen && (
                  <span className="text-xs text-white/40 block">离线</span>
                )}
              </>
            )}
          </div>

          {isAIReplying && replyingAI && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/40 flex items-center gap-1"
            >
              {getUser(replyingAI)?.name} 正在输入
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                ...
              </motion.span>
            </motion.span>
          )}

          {isGroup && (
            <button
              onClick={() => setShowGroupInfo(!showGroupInfo)}
              className="text-white/50 hover:text-white/80 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {showGroupInfo && isGroup && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 glass-nav shadow-lg"
          >
            <div className="max-w-lg mx-auto p-4">
              <h4 className="text-sm font-medium text-white mb-3">群成员</h4>
              <div className="flex flex-wrap gap-2">
                {groupMembers.map(member => {
                  const m = member as any;
                  const isAI = m.id?.startsWith('ai-');
                  return (
                    <div key={m.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                      isAI ? 'bg-violet-500/15' : 'bg-white/5'
                    }`}>
                      <div className="relative">
                        <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover" />
                        {isAI && (
                          <div className="absolute -top-0.5 -right-0.5 px-0.5 py-0.5 bg-violet-500 rounded-full">
                            <span className="text-[5px] text-white font-bold">AI</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-white/80">{m.name}</span>
                      {m.isOnline && !isAI && (
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      )}
                    </div>
                  );
                })}
              </div>
              {aiMembers.length > 0 && (
                <p className="text-[10px] text-white/40 mt-2">
                  💡 提及 AI 名字即可让其回复，例如 @小美
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className="flex-1 overflow-y-auto pt-16 pb-32 px-4 max-w-lg mx-auto w-full relative"
        style={chatBackground ? { backgroundColor: 'rgba(0,0,0,0.4)' } : undefined}
      >
        <div className="flex flex-col gap-3 py-4">
          {conversation.messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-5xl mb-4">{isGroup ? '👥' : '🌸'}</div>
              <p className="text-sm text-white/50">
                {isGroup ? '群聊已创建，开始聊天吧' : `和${displayName}开始对话吧`}
              </p>
              {isGroup && aiMembers.length > 0 && (
                <p className="text-xs text-white/40 mt-2">
                  提及 AI 名字即可让其回复
                </p>
              )}
            </motion.div>
          ) : (
            conversation.messages.map((msg, index) => {
              const prevMsg = index > 0 ? conversation.messages[index - 1] : undefined;
              const showDate = shouldShowDateSeparator(msg.timestamp, prevMsg?.timestamp);
              const isMe = msg.senderId === 'current' || msg.senderId === currentUser?.id;
              const sender = getUser(msg.senderId);
              const showSender = isGroup && !isMe && msg.senderId !== prevMsg?.senderId;
              
              return (
                <div key={msg.id}>
                  {showDate && <DateSeparator timestamp={msg.timestamp} />}
                  <ChatBubble
                    text={msg.text}
                    isMe={isMe}
                    timestamp={msg.timestamp}
                    image={msg.image}
                    audio={msg.audio}
                    sticker={msg.sticker}
                    isRead={msg.isRead}
                    readAt={msg.readAt}
                    status={msg.status}
                    reactions={msg.reactions}
                    onReact={(emoji) => handleReact(msg.id, emoji)}
                    senderName={sender?.name}
                    senderAvatar={sender?.avatar}
                    showSender={showSender}
                  />
                </div>
              );
            })
          )}
          
          <AnimatePresence>
            {isAIReplying && (
              <TypingIndicator isVisible={isAIReplying} />
            )}
          </AnimatePresence>
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <AnimatePresence>
          {showQuickReplies && !isAIReplying && conversation.messages.length > 0 && !isGroup && (
            <div className="max-w-lg mx-auto mb-2">
              <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
            </div>
          )}
        </AnimatePresence>
        <ChatInput onSend={handleSend} />
      </div>

      <AnimatePresence>
        {showFollowModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowFollowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 w-full max-w-sm shadow-xl glass-card border border-white/10"
            >
              <div className="text-center mb-5">
                <div className="text-5xl mb-3">🌟</div>
                <h3 className="text-lg font-semibold text-white mb-2">关注后可继续聊天</h3>
                <p className="text-sm text-white/50">
                  未关注状态下只能发送3条私信，关注后可无限畅聊
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const followedAI = JSON.parse(localStorage.getItem('followedAI') || '[]');
                    if (otherUser?.id && !followedAI.includes(otherUser.id)) {
                      followedAI.push(otherUser.id);
                      localStorage.setItem('followedAI', JSON.stringify(followedAI));
                    }
                    setShowFollowModal(false);
                    if (pendingAIMessage && conversation) {
                      sendMessage(conversation.id, pendingAIMessage.text, pendingAIMessage.image, undefined, undefined, true);
                      setTimeout(() => {
                        getAIReply(pendingAIMessage.text, pendingAIMessage.image);
                      }, 500);
                      setPendingAIMessage(null);
                    }
                  }}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-medium shadow-md shadow-rose-200"
                >
                  ✓ 直接关注
                </button>
                <button
                  onClick={() => {
                    setPendingAIMessage(null);
                    setShowFollowModal(false);
                    router.push(`/user/${otherUser?.id}`);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white/5 text-white/80 rounded-xl text-sm font-medium hover:bg-white/8 transition-colors"
                >
                  去主页
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GroupSettingsModal
        isOpen={showGroupSettings}
        onClose={() => setShowGroupSettings(false)}
        conversationId={id}
      />
    </div>
  );
}
