import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'missed-you.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    initializeDatabase();
  }
  return db;
}

function initializeDatabase() {
  const database = db!;

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      user_code TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER DEFAULT 0,
      city TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      interests TEXT DEFAULT '[]',
      photos TEXT DEFAULT '[]',
      role TEXT DEFAULT 'user',
      is_online INTEGER DEFAULT 0,
      last_seen INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversation_participants (
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      PRIMARY KEY (conversation_id, user_id),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      text TEXT DEFAULT '',
      image TEXT,
      audio TEXT,
      is_read INTEGER DEFAULT 0,
      read_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS message_reactions (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      emoji TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      UNIQUE(message_id, user_id, emoji),
      FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (user_id, target_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (target_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL,
      user2_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS follows (
      id TEXT PRIMARY KEY,
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS post_bookmarks (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
  `);

  // Add plain_password column if it doesn't exist
  try {
    database.prepare("SELECT plain_password FROM users LIMIT 1").get();
  } catch {
    database.prepare("ALTER TABLE users ADD COLUMN plain_password TEXT DEFAULT ''").run();
  }

  // Ensure all existing users have a user_code
  const usersWithoutCode = database.prepare("SELECT id FROM users WHERE user_code IS NULL OR user_code = ''").all() as any[];
  for (const user of usersWithoutCode) {
    const code = generateUserCode();
    database.prepare('UPDATE users SET user_code = ? WHERE id = ?').run(code, user.id);
  }
}

export interface DBUser {
  id: string;
  user_code: string;
  email: string;
  password: string;
  name: string;
  age: number;
  city: string;
  avatar: string;
  bio: string;
  interests: string[];
  photos: string[];
  role: string;
  is_online: number;
  last_seen: number | null;
  created_at: number;
  updated_at: number;
}

export interface DBConversation {
  id: string;
  created_at: number;
  updated_at: number;
}

export interface DBMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  image: string | null;
  audio: string | null;
  is_read: number;
  read_at: number | null;
  created_at: number;
}

export interface DBMessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: number;
}

export interface DBLike {
  user_id: string;
  target_id: string;
  created_at: number;
}

export interface DBMatch {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: number;
}

// User operations
export function createUser(email: string, password: string, name: string, role: string = 'user'): DBUser {
  const database = getDb();
  const id = uuidv4();
  const userCode = generateUserCode();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const now = Date.now();

  database.prepare(`
    INSERT INTO users (id, user_code, email, password, plain_password, name, role, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userCode, email, hashedPassword, password, name, role, now, now);

  return getUserById(id)!;
}

function generateUserCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getUserById(id: string): DBUser | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    ...row,
    interests: JSON.parse(row.interests || '[]'),
    photos: JSON.parse(row.photos || '[]'),
  };
}

export function getUserByEmail(email: string): DBUser | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!row) return null;
  return {
    ...row,
    interests: JSON.parse(row.interests || '[]'),
    photos: JSON.parse(row.photos || '[]'),
  };
}

export function getUserByUserCode(userCode: string): DBUser | null {
  const database = getDb();
  const row = database.prepare('SELECT * FROM users WHERE user_code = ?').get(userCode) as any;
  if (!row) return null;
  return {
    ...row,
    interests: JSON.parse(row.interests || '[]'),
    photos: JSON.parse(row.photos || '[]'),
  };
}

export function updateUser(id: string, data: Partial<Omit<DBUser, 'id' | 'created_at' | 'updated_at'>>): void {
  const database = getDb();
  const now = Date.now();
  const updates: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
  if (data.age !== undefined) { updates.push('age = ?'); values.push(data.age); }
  if (data.city !== undefined) { updates.push('city = ?'); values.push(data.city); }
  if (data.avatar !== undefined) { updates.push('avatar = ?'); values.push(data.avatar); }
  if (data.bio !== undefined) { updates.push('bio = ?'); values.push(data.bio); }
  if (data.interests !== undefined) { updates.push('interests = ?'); values.push(JSON.stringify(data.interests)); }
  if (data.photos !== undefined) { updates.push('photos = ?'); values.push(JSON.stringify(data.photos)); }
  if (data.is_online !== undefined) { updates.push('is_online = ?'); values.push(data.is_online); }
  if (data.last_seen !== undefined) { updates.push('last_seen = ?'); values.push(data.last_seen); }

  if (updates.length === 0) return;

  updates.push('updated_at = ?');
  values.push(now);
  values.push(id);

  database.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
}

export function updateUserPassword(userId: string, newPassword: string): void {
  const database = getDb();
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const now = Date.now();
  database.prepare('UPDATE users SET password = ?, plain_password = ?, updated_at = ? WHERE id = ?').run(hashedPassword, newPassword, now, userId);
}

export function getAllUsers(): DBUser[] {
  const database = getDb();
  const rows = database.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
  return rows.map(row => ({
    ...row,
    interests: JSON.parse(row.interests || '[]'),
    photos: JSON.parse(row.photos || '[]'),
  }));
}

export function migrateUserCodes(): number {
  const database = getDb();
  const usersWithoutCode = database.prepare("SELECT id FROM users WHERE user_code IS NULL OR user_code = ''").all() as any[];
  
  let count = 0;
  for (const user of usersWithoutCode) {
    const userCode = generateUserCode();
    database.prepare('UPDATE users SET user_code = ? WHERE id = ?').run(userCode, user.id);
    count++;
  }
  return count;
}

export function deleteUser(id: string): void {
  const database = getDb();
  database.prepare('DELETE FROM users WHERE id = ?').run(id);
}

// Conversation operations
export function createConversation(participantIds: string[]): DBConversation {
  const database = getDb();
  const id = uuidv4();
  const now = Date.now();

  database.prepare('INSERT INTO conversations (id, created_at, updated_at) VALUES (?, ?, ?)').run(id, now, now);
  
  const insertParticipant = database.prepare(
    'INSERT INTO conversation_participants (conversation_id, user_id, joined_at) VALUES (?, ?, ?)'
  );
  
  for (const userId of participantIds) {
    insertParticipant.run(id, userId, now);
  }

  return { id, created_at: now, updated_at: now };
}

export function getConversationById(id: string): DBConversation | null {
  const database = getDb();
  return database.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as DBConversation | null;
}

export function getUserConversations(userId: string): DBConversation[] {
  const database = getDb();
  return database.prepare(`
    SELECT c.* FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.user_id = ?
    ORDER BY c.updated_at DESC
  `).all(userId) as DBConversation[];
}

export function getConversationParticipants(conversationId: string): string[] {
  const database = getDb();
  const rows = database.prepare(
    'SELECT user_id FROM conversation_participants WHERE conversation_id = ?'
  ).all(conversationId) as any[];
  return rows.map(r => r.user_id);
}

export function findConversationBetweenUsers(user1Id: string, user2Id: string): DBConversation | null {
  const database = getDb();
  const row = database.prepare(`
    SELECT c.* FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ?
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ?
  `).get(user1Id, user2Id) as DBConversation | null;
  return row;
}

// Message operations
export function createMessage(conversationId: string, senderId: string, text: string, image?: string, audio?: string): DBMessage {
  const database = getDb();
  const id = uuidv4();
  const now = Date.now();

  database.prepare(`
    INSERT INTO messages (id, conversation_id, sender_id, text, image, audio, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, conversationId, senderId, text, image || null, audio || null, now);

  database.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(now, conversationId);

  return { id, conversation_id: conversationId, sender_id: senderId, text, image: image || null, audio: audio || null, is_read: 0, read_at: null, created_at: now };
}

export function getConversationMessages(conversationId: string, limit: number = 50): DBMessage[] {
  const database = getDb();
  return database.prepare(`
    SELECT * FROM messages WHERE conversation_id = ?
    ORDER BY created_at ASC LIMIT ?
  `).all(conversationId, limit) as DBMessage[];
}

export function markMessagesAsRead(conversationId: string, userId: string): void {
  const database = getDb();
  const now = Date.now();
  database.prepare(`
    UPDATE messages SET is_read = 1, read_at = ?
    WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
  `).run(now, conversationId, userId);
}

export function getMessageReactions(messageId: string): DBMessageReaction[] {
  const database = getDb();
  return database.prepare('SELECT * FROM message_reactions WHERE message_id = ?').all(messageId) as DBMessageReaction[];
}

export function addMessageReaction(messageId: string, userId: string, emoji: string): void {
  const database = getDb();
  const id = uuidv4();
  const now = Date.now();
  
  database.prepare(`
    INSERT OR REPLACE INTO message_reactions (id, message_id, user_id, emoji, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, messageId, userId, emoji, now);
}

export function removeMessageReaction(messageId: string, userId: string, emoji: string): void {
  const database = getDb();
  database.prepare('DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?').run(messageId, userId, emoji);
}

// Like operations
export function addLike(userId: string, targetId: string): void {
  const database = getDb();
  const now = Date.now();
  database.prepare('INSERT OR IGNORE INTO likes (user_id, target_id, created_at) VALUES (?, ?, ?)').run(userId, targetId, now);
}

export function getLikesByUser(userId: string): DBLike[] {
  const database = getDb();
  return database.prepare('SELECT * FROM likes WHERE user_id = ?').all(userId) as DBLike[];
}

export function getLikedByUsers(targetId: string): DBLike[] {
  const database = getDb();
  return database.prepare('SELECT * FROM likes WHERE target_id = ?').all(targetId) as DBLike[];
}

// Match operations
export function createMatch(user1Id: string, user2Id: string): DBMatch | null {
  const database = getDb();
  
  const existingMatch = database.prepare(`
    SELECT * FROM matches 
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `).get(user1Id, user2Id, user2Id, user1Id) as DBMatch | null;
  
  if (existingMatch) return existingMatch;

  const id = uuidv4();
  const now = Date.now();
  
  database.prepare('INSERT INTO matches (id, user1_id, user2_id, created_at) VALUES (?, ?, ?, ?)').run(id, user1Id, user2Id, now);
  
  const conversation = createConversation([user1Id, user2Id]);
  
  return { id, user1_id: user1Id, user2_id: user2Id, created_at: now };
}

export function getUserMatches(userId: string): DBMatch[] {
  const database = getDb();
  return database.prepare(`
    SELECT * FROM matches WHERE user1_id = ? OR user2_id = ?
  `).all(userId, userId) as DBMatch[];
}

export function checkMutualLike(userId: string, targetId: string): boolean {
  const database = getDb();
  const like1 = database.prepare('SELECT 1 FROM likes WHERE user_id = ? AND target_id = ?').get(userId, targetId);
  const like2 = database.prepare('SELECT 1 FROM likes WHERE user_id = ? AND target_id = ?').get(targetId, userId);
  return !!like1 && !!like2;
}

// Admin statistics
export function getStats() {
  const database = getDb();
  
  const userCount = (database.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const conversationCount = (database.prepare('SELECT COUNT(*) as count FROM conversations').get() as any).count;
  const messageCount = (database.prepare('SELECT COUNT(*) as count FROM messages').get() as any).count;
  const matchCount = (database.prepare('SELECT COUNT(*) as count FROM matches').get() as any).count;
  
  const recentUsers = database.prepare(`
    SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5
  `).all();
  
  const recentMessages = database.prepare(`
    SELECT m.*, u.name as sender_name FROM messages m
    JOIN users u ON m.sender_id = u.id
    ORDER BY m.created_at DESC LIMIT 10
  `).all();

  return {
    userCount,
    conversationCount,
    messageCount,
    matchCount,
    recentUsers,
    recentMessages,
  };
}

export function verifyPassword(email: string, password: string): DBUser | null {
  const user = getUserByEmail(email);
  if (!user) return null;
  
  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) return null;
  
  return user;
}

export function updateOnlineStatus(userId: string, isOnline: boolean): void {
  const database = getDb();
  const now = Date.now();
  database.prepare('UPDATE users SET is_online = ?, last_seen = ? WHERE id = ?').run(isOnline ? 1 : 0, now, userId);
}

export function deleteUserCascade(id: string): void {
  const database = getDb();
  
  database.prepare('DELETE FROM message_reactions WHERE user_id = ?').run(id);
  database.prepare('DELETE FROM messages WHERE sender_id = ?').run(id);
  database.prepare('DELETE FROM conversation_participants WHERE user_id = ?').run(id);
  database.prepare('DELETE FROM likes WHERE user_id = ? OR target_id = ?').run(id, id);
  database.prepare('DELETE FROM matches WHERE user1_id = ? OR user2_id = ?').run(id, id);
  
  const conversations = database.prepare(`
    SELECT DISTINCT conversation_id FROM conversation_participants 
    WHERE conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = ?
    )
  `).all(id) as any[];
  
  for (const conv of conversations) {
    const participants = getConversationParticipants(conv.conversation_id);
    if (participants.length <= 1) {
      database.prepare('DELETE FROM messages WHERE conversation_id = ?').run(conv.conversation_id);
      database.prepare('DELETE FROM conversation_participants WHERE conversation_id = ?').run(conv.conversation_id);
      database.prepare('DELETE FROM conversations WHERE id = ?').run(conv.conversation_id);
    }
  }
  
  database.prepare('DELETE FROM users WHERE id = ?').run(id);
}

export function getUnreadCount(conversationId: string, userId: string): number {
  const database = getDb();
  const result = database.prepare(`
    SELECT COUNT(*) as count FROM messages 
    WHERE conversation_id = ? AND sender_id != ? AND is_read = 0
  `).get(conversationId, userId) as any;
  return result.count;
}

// Post operations
export interface DBPost {
  id: string;
  user_id: string;
  content: string;
  image: string | null;
  likes_count: number;
  comments_count: number;
  created_at: number;
  updated_at: number;
}

export interface DBComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: number;
}

export function createPost(userId: string, content: string, image?: string): DBPost {
  const database = getDb();
  const id = uuidv4();
  const now = Date.now();

  database.prepare(`
    INSERT INTO posts (id, user_id, content, image, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, userId, content, image || null, now, now);

  return { id, user_id: userId, content, image: image || null, likes_count: 0, comments_count: 0, created_at: now, updated_at: now };
}

export function getPosts(limit: number = 20, offset: number = 0): any[] {
  const database = getDb();
  return database.prepare(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
}

export function getPostById(id: string): any | null {
  const database = getDb();
  return database.prepare(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
  `).get(id);
}

export function deletePost(id: string): void {
  const database = getDb();
  database.prepare('DELETE FROM comments WHERE post_id = ?').run(id);
  database.prepare('DELETE FROM post_likes WHERE post_id = ?').run(id);
  database.prepare('DELETE FROM posts WHERE id = ?').run(id);
}

export function createComment(postId: string, userId: string, content: string): DBComment {
  const database = getDb();
  const id = uuidv4();
  const now = Date.now();

  database.prepare(`
    INSERT INTO comments (id, post_id, user_id, content, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, postId, userId, content, now);

  database.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId);

  return { id, post_id: postId, user_id: userId, content, created_at: now };
}

export function getPostComments(postId: string): any[] {
  const database = getDb();
  return database.prepare(`
    SELECT c.*, u.name as author_name, u.avatar as author_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(postId);
}

export function deleteComment(id: string): void {
  const database = getDb();
  const comment = database.prepare('SELECT post_id FROM comments WHERE id = ?').get(id) as any;
  if (comment) {
    database.prepare('UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?').run(comment.post_id);
  }
  database.prepare('DELETE FROM comments WHERE id = ?').run(id);
}

export function togglePostLike(postId: string, userId: string): boolean {
  const database = getDb();
  const existing = database.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  
  if (existing) {
    database.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
    database.prepare('UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?').run(postId);
    return false;
  } else {
    const now = Date.now();
    database.prepare('INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)').run(postId, userId, now);
    database.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
    return true;
  }
}

export function isPostLiked(postId: string, userId: string): boolean {
  const database = getDb();
  const result = database.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, userId);
  return !!result;
}

export function getUserPosts(userId: string): any[] {
  const database = getDb();
  return database.prepare(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(userId);
}

export function togglePostBookmark(postId: string, userId: string): boolean {
  const database = getDb();
  const existing = database.prepare('SELECT 1 FROM post_bookmarks WHERE post_id = ? AND user_id = ?').get(postId, userId);
  if (existing) {
    database.prepare('DELETE FROM post_bookmarks WHERE post_id = ? AND user_id = ?').run(postId, userId);
    return false;
  } else {
    database.prepare('INSERT INTO post_bookmarks (post_id, user_id, created_at) VALUES (?, ?, ?)').run(postId, userId, Date.now());
    return true;
  }
}

export function isPostBookmarked(postId: string, userId: string): boolean {
  const database = getDb();
  const result = database.prepare('SELECT 1 FROM post_bookmarks WHERE post_id = ? AND user_id = ?').get(postId, userId);
  return !!result;
}

export function getUserBookmarks(userId: string): any[] {
  const database = getDb();
  return database.prepare(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM post_bookmarks pb
    JOIN posts p ON pb.post_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE pb.user_id = ?
    ORDER BY pb.created_at DESC
  `).all(userId);
}

export default getDb;
