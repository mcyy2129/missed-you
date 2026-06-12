"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { User, Conversation, Message, SwipeDirection } from "./types";
import { CURRENT_USER, MOCK_USERS, MOCK_CONVERSATIONS } from "./mock-data";

interface AppState {
  currentUser: User | null;
  users: User[];
  conversations: Conversation[];
  likedUsers: Set<string>;
  matchedUsers: Set<string>;
  isLoggedIn: boolean;
  isOnboarded: boolean;
}

interface AppActions {
  login: (name: string, age: number, city: string) => void;
  completeProfile: (bio: string, interests: string[]) => void;
  swipeUser: (userId: string, direction: SwipeDirection) => boolean;
  sendMessage: (conversationId: string, text: string) => void;
  getConversation: (userId: string) => Conversation | undefined;
  getUser: (userId: string) => User | undefined;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [matchedUsers, setMatchedUsers] = useState<Set<string>>(new Set());
  const [isOnboarded, setIsOnboarded] = useState(false);

  const login = useCallback((name: string, age: number, city: string) => {
    setCurrentUser({
      ...CURRENT_USER,
      name,
      age,
      city,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      photos: [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}1`,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}2`,
      ],
    });
  }, []);

  const completeProfile = useCallback((bio: string, interests: string[]) => {
    setCurrentUser((prev) => (prev ? { ...prev, bio, interests } : prev));
    setIsOnboarded(true);
  }, []);

  const swipeUser = useCallback(
    (userId: string, direction: SwipeDirection): boolean => {
      if (direction === "right") {
        setLikedUsers((prev) => new Set(prev).add(userId));
        if (Math.random() < 0.6) {
          setMatchedUsers((prev) => new Set(prev).add(userId));
          const newConv: Conversation = {
            id: `conv-${Date.now()}`,
            participants: ["current", userId],
            messages: [],
          };
          setConversations((prev) => [...prev, newConv]);
          return true;
        }
      }
      return false;
    },
    []
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const msg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        senderId: "current",
        text,
        timestamp: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, msg], lastMessage: msg }
            : c
        )
      );
    },
    []
  );

  const getConversation = useCallback(
    (userId: string) =>
      conversations.find((c) => c.participants.includes(userId)),
    [conversations]
  );

  const getUser = useCallback(
    (userId: string) => {
      if (userId === "current") return currentUser ?? undefined;
      return users.find((u) => u.id === userId);
    },
    [currentUser, users]
  );

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
        login,
        completeProfile,
        swipeUser,
        sendMessage,
        getConversation,
        getUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
