export interface User {
  id: string;
  userCode?: string;
  email?: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
  bio: string;
  interests: string[];
  photos: string[];
  isOnline?: boolean;
  lastSeen?: number;
  role?: string;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  image?: string;
  audio?: string;
  isRead?: boolean;
  readAt?: number;
  reactions?: MessageReaction[];
  sticker?: string;
}

export interface CustomEmoji {
  id: string;
  url: string;
  name: string;
  createdBy: string;
  createdAt: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  isGroup?: boolean;
  groupName?: string;
  groupAvatar?: string;
  groupDescription?: string;
  createdBy?: string;
  created_at?: number;
}

export type SwipeDirection = 'left' | 'right' | 'up';

export interface AISkill {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  responseStyle: 'cute' | 'mature' | 'mysterious' | 'playful' | 'gentle';
  greetingTemplate: string;
  personalityTraits: string[];
  conversationStarters: string[];
  responseTemplates: Record<string, string[]>;
}
