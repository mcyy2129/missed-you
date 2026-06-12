export interface User {
  id: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
  bio: string;
  interests: string[];
  photos: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  messages: Message[];
  lastMessage?: Message;
}

export type SwipeDirection = 'left' | 'right' | 'up';
