"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User, Conversation, Message, SwipeDirection, MessageReaction } from "./types";

const FETCH_TIMEOUT = 8000;

async function fetchWithTimeout(url: string, options?: RequestInit, timeout = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function fetchWithRetry(url: string, options?: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (e) {
      if (i === retries) throw e;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error('fetch failed');
}

interface DanmakuMessage {
  id: number;
  text: string;
  color: string;
  top: number;
  speed: number;
  createdAt: number;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  conversations: Conversation[];
  likedUsers: Set<string>;
  matchedUsers: Set<string>;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  isDataLoaded: boolean;
  danmakuMessages: DanmakuMessage[];
  isDanmakuEnabled: boolean;
  themeBackground: string;
  chatBackground: string;
}

interface AppActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  completeProfile: (bio: string, interests: string[]) => Promise<void>;
  updatePhotos: (photos: string[]) => Promise<void>;
  updateProfile: (data: { name?: string; age?: number; city?: string; bio?: string; avatar?: string; interests?: string[] }) => Promise<void>;
  swipeUser: (userId: string, direction: SwipeDirection) => Promise<boolean>;
  sendMessage: (conversationId: string, text: string, image?: string, audio?: string, sticker?: string, skipServer?: boolean) => Promise<void>;
  addAIMessage: (conversationId: string, text: string, senderId?: string, image?: string, sticker?: string) => void;
  addReaction: (conversationId: string, messageId: string, emoji: string) => void;
  markAsRead: (conversationId: string) => void;
  getUnreadCount: (conversationId: string) => number;
  getConversation: (userId: string) => Conversation | undefined;
  getUser: (userId: string) => User | undefined;
  createConversation: (participantId: string) => Promise<Conversation>;
  createGroupChat: (name: string, participantIds: string[]) => Conversation;
  updateGroupSettings: (conversationId: string, updates: { groupName?: string; groupDescription?: string; groupAvatar?: string }) => void;
  removeGroupMember: (conversationId: string, userId: string) => void;
  addGroupMember: (conversationId: string, userId: string) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  getTotalUnread: () => number;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setDanmakuMessages: React.Dispatch<React.SetStateAction<DanmakuMessage[]>>;
  addDanmaku: (text: string) => void;
  toggleDanmaku: () => void;
  setThemeBackground: (url: string) => void;
  setChatBackground: (url: string) => void;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [matchedUsers, setMatchedUsers] = useState<Set<string>>(new Set());
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [danmakuMessages, setDanmakuMessages] = useState<DanmakuMessage[]>([]);
  const [isDanmakuEnabled, setIsDanmakuEnabled] = useState(true);
  const [themeBackground, setThemeBackgroundState] = useState('/bg.png');
  const [chatBackground, setChatBackgroundState] = useState('');
  const danmakuIdRef = { current: 0 };

  const persistConversations = useCallback((convs: Conversation[]) => {
    try {
      localStorage.setItem('conversations', JSON.stringify(convs));
    } catch (e) {
      console.error('Failed to persist conversations:', e);
    }
  }, []);

  let persistTimer: ReturnType<typeof setTimeout> | null = null;
  const debouncedPersist = useCallback((convs: Conversation[]) => {
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => persistConversations(convs), 1000);
  }, [persistConversations]);

  const fetchConversationMessages = useCallback(async (conversationId: string, after?: number) => {
    try {
      const params = new URLSearchParams({ conversationId });
      if (after) params.set('after', after.toString());
      
      const res = await fetch(`/api/messages?${params}`);
      if (!res.ok) return [];
      
      const messages = await res.json();
      return messages.map((m: any) => ({
        id: m.id,
        senderId: m.senderId,
        text: m.text,
        timestamp: m.timestamp,
        image: m.image || undefined,
        audio: m.audio || undefined,
        isRead: m.isRead,
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }, []);

  let syncTimeout: NodeJS.Timeout | null = null;
  
  const syncConversationMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetchWithTimeout(`/api/messages?conversationId=${conversationId}`);
      if (!res.ok) return;

      const serverMessages = await res.json();
      if (serverMessages.length === 0) return;

      setConversations((prev) => {
        const conv = prev.find(c => c.id === conversationId);

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
          }));

        if (newMessages.length === 0 && conv) return prev;

        if (!conv) {
          const newConv: Conversation = {
            id: conversationId,
            participants: [...new Set(newMessages.map((m: any) => m.senderId))] as string[],
            messages: newMessages.sort((a: any, b: any) => a.timestamp - b.timestamp),
            lastMessage: newMessages[newMessages.length - 1],
          };
          const updated = [...prev, newConv];
          debouncedPersist(updated);
          return updated;
        }

        const updated = prev.map(c => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: [...c.messages, ...newMessages].sort((a, b) => a.timestamp - b.timestamp),
            lastMessage: newMessages[newMessages.length - 1],
          };
        });
        debouncedPersist(updated);
        return updated;
      });
    } catch (error) {
      console.error('Failed to sync messages:', error);
    }
  }, [debouncedPersist]);

  const fetchUserData = useCallback(async (userId: string) => {
    let localConvs: Conversation[] = [];
    try {
      const savedConvs = localStorage.getItem('conversations');
      if (savedConvs) {
        localConvs = JSON.parse(savedConvs);
        if (localConvs.length > 0) {
          setConversations(localConvs);
        }
      }
    } catch (e) {
      console.error('Failed to load local conversations:', e);
    }
    setIsDataLoaded(true);

    try {
      const [usersRes, aiPersonasRes, convsRes] = await Promise.all([
        fetchWithRetry('/api/admin/users'),
        fetchWithRetry('/api/admin/ai-personas'),
        fetchWithRetry(`/api/conversations?userId=${userId}`),
      ]);

      const [usersData, aiData, allConvs] = await Promise.all([
        usersRes.json(),
        aiPersonasRes.json(),
        convsRes.json(),
      ]);

      const allUsers = Array.isArray(usersData) ? usersData : [];
      const aiPersonas = Array.isArray(aiData) ? aiData : [];
      
      const mappedUsers: User[] = allUsers.map((u: any) => ({
        id: u.id,
        userCode: u.user_code,
        name: u.name,
        age: u.age,
        city: u.city,
        avatar: u.avatar,
        bio: u.bio,
        interests: u.interests,
        photos: u.photos,
        isOnline: u.is_online === 1,
        lastSeen: u.last_seen,
      }));
      
      const aiUsers: User[] = aiPersonas.map((p: any) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        city: p.city,
        avatar: p.avatar,
        bio: p.bio,
        interests: p.interests,
        photos: [],
        isOnline: true,
      }));
      
      setUsers([...mappedUsers.filter((u: User) => u.id !== userId), ...aiUsers]);

      let apiConvs: Conversation[] = [];
      try {
        apiConvs = allConvs.map((c: any) => ({
          id: c.id,
          participants: c.participants,
          messages: [] as Message[],
          lastMessage: c.lastMessage ? {
            id: c.lastMessage.id,
            senderId: c.lastMessage.senderId,
            text: c.lastMessage.text,
            timestamp: c.lastMessage.timestamp,
          } : undefined,
          unreadCount: 0,
        }));
      } catch (e) {
        console.error('Failed to process conversations:', e);
      }

      const localGroupChats = localConvs.filter(c => c.isGroup);
      const localPrivateChats = localConvs.filter(c => !c.isGroup);
      
      const allConvIds = new Set<string>();
      const mergedConvs: Conversation[] = [];
      
      for (const conv of apiConvs) {
        if (!allConvIds.has(conv.id)) {
          allConvIds.add(conv.id);
          mergedConvs.push(conv);
        }
      }
      
      for (const conv of localGroupChats) {
        if (!allConvIds.has(conv.id)) {
          allConvIds.add(conv.id);
          mergedConvs.push(conv);
        }
      }
      
      for (const conv of localPrivateChats) {
        if (!allConvIds.has(conv.id)) {
          allConvIds.add(conv.id);
          mergedConvs.push(conv);
        }
      }

      setConversations(mergedConvs);
      localStorage.setItem('conversations', JSON.stringify(mergedConvs));
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, []);

  useEffect(() => {
    const savedConvs = localStorage.getItem('conversations');
    if (savedConvs) {
      try {
        const parsed = JSON.parse(savedConvs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
        }
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsOnboarded(!!user.bio);
        document.cookie = `userRole=${user.role || 'user'}; path=/; max-age=86400`;
        fetchUserData(user.id);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }

    const savedThemeBg = localStorage.getItem('themeBackground');
    if (savedThemeBg) setThemeBackgroundState(savedThemeBg);
    const savedChatBg = localStorage.getItem('chatBackground');
    if (savedChatBg) setChatBackgroundState(savedChatBg);
  }, [fetchUserData]);

  useEffect(() => {
    if (!currentUser) return;

    const syncAllConversations = async () => {
      for (const conv of conversations) {
        syncConversationMessages(conv.id);
      }
    };

    syncAllConversations();
    const interval = setInterval(syncAllConversations, 30000);

    return () => clearInterval(interval);
  }, [currentUser, conversations.length, syncConversationMessages]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      setCurrentUser(data);
      setIsOnboarded(!!data.bio);
      localStorage.setItem('currentUser', JSON.stringify(data));
      document.cookie = 'isLoggedIn=true; path=/; max-age=86400';
      document.cookie = `userRole=${data.role || 'user'}; path=/; max-age=86400`;
      
      await fetchUserData(data.id);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [fetchUserData]);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const res = await fetchWithTimeout('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      const newUser: User = {
        id: data.id,
        userCode: data.userCode,
        email: data.email,
        name: data.name,
        age: 0,
        city: '',
        avatar: '',
        bio: '',
        interests: [],
        photos: [],
      };
      setCurrentUser(newUser);
      setIsOnboarded(false);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      document.cookie = 'isLoggedIn=true; path=/; max-age=86400';
      document.cookie = 'userRole=user; path=/; max-age=86400';
      
      await fetchUserData(data.id);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, [fetchUserData]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUsers([]);
    setConversations([]);
    setLikedUsers(new Set());
    setMatchedUsers(new Set());
    setIsOnboarded(false);
    localStorage.removeItem('currentUser');
    document.cookie = 'isLoggedIn=; path=/; max-age=0';
    document.cookie = 'userRole=; path=/; max-age=0';
  }, []);

  const completeProfile = useCallback(async (bio: string, interests: string[]) => {
    if (!currentUser) return;

    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          bio,
          interests,
        }),
      });

      const updated = { ...currentUser, bio, interests };
      setCurrentUser(updated);
      setIsOnboarded(true);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch (error) {
      console.error('Complete profile error:', error);
    }
  }, [currentUser]);

  const updatePhotos = useCallback(async (photos: string[]) => {
    if (!currentUser) return;

    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          photos,
        }),
      });

      const updated = { ...currentUser, photos };
      setCurrentUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch (error) {
      console.error('Update photos error:', error);
    }
  }, [currentUser]);

  const updateProfile = useCallback(async (data: { name?: string; age?: number; city?: string; bio?: string; avatar?: string; interests?: string[] }) => {
    if (!currentUser) return;

    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          ...data,
        }),
      });

      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    } catch (error) {
      console.error('Update profile error:', error);
    }
  }, [currentUser]);

  const swipeUser = useCallback(
    async (userId: string, direction: SwipeDirection): Promise<boolean> => {
      if (!currentUser) return false;
      
      if (direction === "right") {
        setLikedUsers((prev) => new Set(prev).add(userId));
        
        if (Math.random() < 0.6) {
          setMatchedUsers((prev) => new Set(prev).add(userId));
          
          try {
            const res = await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ participantIds: [currentUser.id, userId] }),
            });
            
            if (res.ok) {
              const serverConv = await res.json();
              const newConv: Conversation = {
                id: serverConv.id,
                participants: serverConv.participants,
                messages: [],
              };
              setConversations((prev) => {
                if (prev.find(c => c.id === serverConv.id)) return prev;
                return [...prev, newConv];
              });
              return true;
            }
          } catch (error) {
            console.error('Failed to create conversation:', error);
          }
          
          const convId = `conv-${Date.now()}`;
          const newConv: Conversation = {
            id: convId,
            participants: [currentUser.id, userId],
            messages: [],
          };
          setConversations((prev) => [...prev, newConv]);
          return true;
        }
      }
      return false;
    },
    [currentUser]
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string, image?: string, audio?: string, sticker?: string, skipServer?: boolean) => {
      if (!currentUser) return;

      const tempId = `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const msg: Message = {
        id: tempId,
        senderId: currentUser.id,
        text,
        timestamp: Date.now(),
        image,
        audio,
        sticker,
        isRead: false,
        status: 'sending' as const,
      };

      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, msg], lastMessage: msg }
            : c
        );
        debouncedPersist(updated);
        return updated;
      });

      // AI conversations skip server - mark as sent immediately
      if (skipServer) {
        setTimeout(() => {
          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === tempId ? { ...m, status: 'sent' as const, isRead: true } : m
                    ),
                  }
                : c
            );
            debouncedPersist(updated);
            return updated;
          });
        }, 300);
        return;
      }

      try {
        const res = await fetchWithTimeout('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId,
            senderId: currentUser.id,
            text,
            image,
            audio,
            sticker,
          }),
        });

        if (res.ok) {
          const serverMsg = await res.json();
          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === tempId ? { ...m, id: serverMsg.id, status: 'sent' as const } : m
                    ),
                  }
                : c
            );
            debouncedPersist(updated);
            return updated;
          });
        } else {
          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === tempId ? { ...m, status: 'failed' as const } : m
                    ),
                  }
                : c
            );
            debouncedPersist(updated);
            return updated;
          });
        }
      } catch (error) {
        console.error('Failed to send message to server:', error);
        setConversations((prev) => {
          const updated = prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === tempId ? { ...m, status: 'failed' as const } : m
                  ),
                }
              : c
          );
          debouncedPersist(updated);
          return updated;
        });
      }
    },
    [currentUser, debouncedPersist]
  );

  const addAIMessage = useCallback(
    (conversationId: string, text: string, senderId?: string, image?: string, sticker?: string) => {
      const msg: Message = {
        id: `msg-ai-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        senderId: senderId || "ai",
        text,
        timestamp: Date.now(),
        image,
        sticker,
        isRead: false,
        status: 'sent' as const,
      };
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, msg], lastMessage: msg, unreadCount: (c.unreadCount || 0) + 1 }
            : c
        );
        debouncedPersist(updated);
        return updated;
      });
    },
    [debouncedPersist]
  );

  const addReaction = useCallback(
    (conversationId: string, messageId: string, emoji: string) => {
      const reaction: MessageReaction = { emoji, userId: currentUser?.id || "current" };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId
                    ? {
                        ...m,
                        reactions: m.reactions
                          ? m.reactions.some((r) => r.emoji === emoji && r.userId === currentUser?.id)
                            ? m.reactions.filter((r) => !(r.emoji === emoji && r.userId === currentUser?.id))
                            : [...m.reactions, reaction]
                          : [reaction],
                      }
                    : m
                ),
              }
            : c
        )
      );
    },
    [currentUser]
  );

  const markAsRead = useCallback(
    (conversationId: string) => {
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                unreadCount: 0,
                messages: c.messages.map((m) =>
                  m.senderId !== currentUser?.id && !m.isRead
                    ? { ...m, isRead: true, readAt: Date.now(), status: 'read' as const }
                    : m
                ),
              }
            : c
        );
        debouncedPersist(updated);
        return updated;
      });

      // Sync read status to server
      fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId: currentUser?.id }),
      }).catch(() => {});
    },
    [currentUser, debouncedPersist]
  );

  const getUnreadCount = useCallback(
    (conversationId: string) => {
      const conv = conversations.find((c) => c.id === conversationId);
      return conv?.unreadCount || 0;
    },
    [conversations]
  );

  const getConversation = useCallback(
    (userId: string) =>
      conversations.find((c) => c.participants.includes(userId)),
    [conversations]
  );

  const getUser = useCallback(
    (userId: string) => {
      if (userId === currentUser?.id) return currentUser ?? undefined;
      const found = users.find((u) => u.id === userId);
      if (found) return found;
      if (userId.startsWith('ai-')) {
        return {
          id: userId,
          name: userId.replace('ai-', ''),
          age: 25,
          city: '北京',
          avatar: `https://i.pravatar.cc/300?u=${userId}`,
          bio: '',
          interests: [],
          photos: [],
          isOnline: true,
        };
      }
      return undefined;
    },
    [currentUser, users]
  );

  const createConversation = useCallback(
    async (participantId: string): Promise<Conversation> => {
      if (!currentUser) throw new Error('Not logged in');
      
      const existingConv = conversations.find(c => 
        !c.isGroup && c.participants.includes(currentUser.id) && c.participants.includes(participantId)
      );
      
      if (existingConv) return existingConv;
      
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantIds: [currentUser.id, participantId] }),
        });
        
        if (res.ok) {
          const serverConv = await res.json();
          const newConv: Conversation = {
            id: serverConv.id,
            participants: serverConv.participants,
            messages: [],
          };
          setConversations(prev => {
            if (prev.find(c => c.id === serverConv.id)) return prev;
            return [...prev, newConv];
          });
          return newConv;
        }
      } catch (error) {
        console.error('Failed to create conversation on server:', error);
      }
      
      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        participants: [currentUser.id, participantId],
        messages: [],
      };
      setConversations(prev => [...prev, newConv]);
      return newConv;
    },
    [currentUser, conversations]
  );

  const createGroupChat = useCallback(
    (name: string, participantIds: string[]): Conversation => {
      if (!currentUser) throw new Error('Not logged in');
      
      const now = Date.now();
      const newConv: Conversation = {
        id: `group-${now}`,
        participants: [currentUser.id, ...participantIds],
        messages: [],
        isGroup: true,
        groupName: name,
        createdBy: currentUser.id,
        created_at: now,
      };
      setConversations(prev => [...prev, newConv]);
      
      try {
        const savedConvs = JSON.parse(localStorage.getItem('conversations') || '[]');
        savedConvs.push({
          ...newConv,
          participants: newConv.participants,
          messages: [],
        });
        localStorage.setItem('conversations', JSON.stringify(savedConvs));
      } catch (e) {
        console.error('Failed to save group chat:', e);
      }
      
      return newConv;
    },
    [currentUser]
  );

  const updateGroupSettings = useCallback(
    (conversationId: string, updates: { groupName?: string; groupDescription?: string; groupAvatar?: string }) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, ...updates }
            : c
        )
      );
      
      try {
        const savedConvs = JSON.parse(localStorage.getItem('conversations') || '[]');
        const updated = savedConvs.map((c: any) =>
          c.id === conversationId ? { ...c, ...updates } : c
        );
        localStorage.setItem('conversations', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update group settings:', e);
      }
    },
    []
  );

  const removeGroupMember = useCallback(
    (conversationId: string, userId: string) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId
            ? { ...c, participants: c.participants.filter(id => id !== userId) }
            : c
        )
      );
      
      try {
        const savedConvs = JSON.parse(localStorage.getItem('conversations') || '[]');
        const updated = savedConvs.map((c: any) =>
          c.id === conversationId
            ? { ...c, participants: c.participants.filter((id: string) => id !== userId) }
            : c
        );
        localStorage.setItem('conversations', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to remove group member:', e);
      }
    },
    []
  );

  const addGroupMember = useCallback(
    (conversationId: string, userId: string) => {
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId && !c.participants.includes(userId)
            ? { ...c, participants: [...c.participants, userId] }
            : c
        )
      );
      
      try {
        const savedConvs = JSON.parse(localStorage.getItem('conversations') || '[]');
        const updated = savedConvs.map((c: any) =>
          c.id === conversationId && !c.participants.includes(userId)
            ? { ...c, participants: [...c.participants, userId] }
            : c
        );
        localStorage.setItem('conversations', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to add group member:', e);
      }
    },
    []
  );

  const setUserOnline = useCallback(
    (userId: string, isOnline: boolean) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, isOnline, lastSeen: isOnline ? undefined : Date.now() }
            : u
        )
      );
    },
    []
  );

  const getTotalUnread = useCallback(
    () => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0),
    [conversations]
  );

  const addDanmaku = useCallback((text: string) => {
    if (!isDanmakuEnabled) return;
    const colors = ['#ff006e', '#8338ec', '#3a86ff', '#06d6a0', '#ffbe0b', '#fff'];
    const msg: DanmakuMessage = {
      id: danmakuIdRef.current++,
      text,
      color: colors[Math.floor(Math.random() * colors.length)],
      top: Math.random() * 85 + 5,
      speed: Math.random() * 3 + 5,
      createdAt: Date.now(),
    };
    setDanmakuMessages(prev => [...prev.slice(-40), msg]);
  }, [isDanmakuEnabled]);

  const toggleDanmaku = useCallback(() => {
    setIsDanmakuEnabled(prev => !prev);
  }, []);

  const setThemeBackground = useCallback((url: string) => {
    setThemeBackgroundState(url);
    if (url) {
      localStorage.setItem('themeBackground', url);
    } else {
      localStorage.removeItem('themeBackground');
    }
  }, []);

  const setChatBackground = useCallback((url: string) => {
    setChatBackgroundState(url);
    if (url) {
      localStorage.setItem('chatBackground', url);
    } else {
      localStorage.removeItem('chatBackground');
    }
  }, []);

  const isLoggedIn = currentUser !== null;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        conversations,
        likedUsers,
        matchedUsers,
        isLoggedIn,
        isOnboarded,
        isDataLoaded,
        login,
        register,
        logout,
        completeProfile,
        updatePhotos,
        updateProfile,
        swipeUser,
        sendMessage,
        addAIMessage,
        addReaction,
        markAsRead,
        getUnreadCount,
        getConversation,
        getUser,
        createConversation,
        createGroupChat,
        updateGroupSettings,
        removeGroupMember,
        addGroupMember,
        setUserOnline,
        getTotalUnread,
        setConversations,
        danmakuMessages,
        isDanmakuEnabled,
        setDanmakuMessages,
        addDanmaku,
        toggleDanmaku,
        themeBackground,
        chatBackground,
        setThemeBackground,
        setChatBackground,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
