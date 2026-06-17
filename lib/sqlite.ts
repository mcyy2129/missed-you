import pool from './db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

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

function mapUser(row: any): DBUser {
  return {
    ...row,
    interests: typeof row.interests === 'string' ? JSON.parse(row.interests || '[]') : row.interests || [],
    photos: typeof row.photos === 'string' ? JSON.parse(row.photos || '[]') : row.photos || [],
  };
}

function generateUserCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createUser(email: string, password: string, name: string, role: string = 'user'): Promise<DBUser> {
  const id = uuidv4();
  const userCode = generateUserCode();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const now = Date.now();

  await pool.query(
    `INSERT INTO users (id, user_code, email, password, plain_password, name, role, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, userCode, email, hashedPassword, password, name, role, now, now]
  );

  return (await getUserById(id))!;
}

export async function getUserById(id: string): Promise<DBUser | null> {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (!rows[0]) return null;
  return mapUser(rows[0]);
}

export async function getUserByEmail(email: string): Promise<DBUser | null> {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (!rows[0]) return null;
  return mapUser(rows[0]);
}

export async function getUserByUserCode(userCode: string): Promise<DBUser | null> {
  const { rows } = await pool.query('SELECT * FROM users WHERE user_code = $1', [userCode]);
  if (!rows[0]) return null;
  return mapUser(rows[0]);
}

export async function updateUser(id: string, data: Partial<Omit<DBUser, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  const now = Date.now();
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) { updates.push(`name = $${paramIndex++}`); values.push(data.name); }
  if (data.age !== undefined) { updates.push(`age = $${paramIndex++}`); values.push(data.age); }
  if (data.city !== undefined) { updates.push(`city = $${paramIndex++}`); values.push(data.city); }
  if (data.avatar !== undefined) { updates.push(`avatar = $${paramIndex++}`); values.push(data.avatar); }
  if (data.bio !== undefined) { updates.push(`bio = $${paramIndex++}`); values.push(data.bio); }
  if (data.interests !== undefined) { updates.push(`interests = $${paramIndex++}`); values.push(JSON.stringify(data.interests)); }
  if (data.photos !== undefined) { updates.push(`photos = $${paramIndex++}`); values.push(JSON.stringify(data.photos)); }
  if (data.is_online !== undefined) { updates.push(`is_online = $${paramIndex++}`); values.push(data.is_online); }
  if (data.last_seen !== undefined) { updates.push(`last_seen = $${paramIndex++}`); values.push(data.last_seen); }

  if (updates.length === 0) return;

  updates.push(`updated_at = $${paramIndex++}`);
  values.push(now);
  values.push(id);

  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const now = Date.now();
  await pool.query(
    'UPDATE users SET password = $1, plain_password = $2, updated_at = $3 WHERE id = $4',
    [hashedPassword, newPassword, now, userId]
  );
}

export async function getAllUsers(): Promise<DBUser[]> {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
  return rows.map(mapUser);
}

export async function migrateUserCodes(): Promise<number> {
  const { rows: usersWithoutCode } = await pool.query(
    "SELECT id FROM users WHERE user_code IS NULL OR user_code = ''"
  );
  for (const user of usersWithoutCode) {
    const code = generateUserCode();
    await pool.query('UPDATE users SET user_code = $1 WHERE id = $2', [code, user.id]);
  }
  return usersWithoutCode.length;
}

export async function deleteUser(id: string): Promise<void> {
  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

// Conversation operations
export async function createConversation(participantIds: string[]): Promise<DBConversation> {
  const id = uuidv4();
  const now = Date.now();

  await pool.query('INSERT INTO conversations (id, created_at, updated_at) VALUES ($1, $2, $3)', [id, now, now]);

  for (const userId of participantIds) {
    await pool.query(
      'INSERT INTO conversation_participants (conversation_id, user_id, joined_at) VALUES ($1, $2, $3)',
      [id, userId, now]
    );
  }

  return { id, created_at: now, updated_at: now };
}

export async function getConversationById(id: string): Promise<DBConversation | null> {
  const { rows } = await pool.query('SELECT * FROM conversations WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getUserConversations(userId: string): Promise<DBConversation[]> {
  const { rows } = await pool.query(`
    SELECT c.* FROM conversations c
    JOIN conversation_participants cp ON c.id = cp.conversation_id
    WHERE cp.user_id = $1
    ORDER BY c.updated_at DESC
  `, [userId]);
  return rows;
}

export async function getConversationParticipants(conversationId: string): Promise<string[]> {
  const { rows } = await pool.query(
    'SELECT user_id FROM conversation_participants WHERE conversation_id = $1',
    [conversationId]
  );
  return rows.map((r: any) => r.user_id);
}

export async function findConversationBetweenUsers(user1Id: string, user2Id: string): Promise<DBConversation | null> {
  const { rows } = await pool.query(`
    SELECT c.* FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = $1
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = $2
  `, [user1Id, user2Id]);
  return rows[0] || null;
}

// Message operations
export async function createMessage(conversationId: string, senderId: string, text: string, image?: string, audio?: string): Promise<DBMessage> {
  const id = uuidv4();
  const now = Date.now();

  await pool.query(
    `INSERT INTO messages (id, conversation_id, sender_id, text, image, audio, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, conversationId, senderId, text, image || null, audio || null, now]
  );

  await pool.query('UPDATE conversations SET updated_at = $1 WHERE id = $2', [now, conversationId]);

  return { id, conversation_id: conversationId, sender_id: senderId, text, image: image || null, audio: audio || null, is_read: 0, read_at: null, created_at: now };
}

export async function getConversationMessages(conversationId: string, limit: number = 50): Promise<DBMessage[]> {
  const { rows } = await pool.query(`
    SELECT * FROM messages WHERE conversation_id = $1
    ORDER BY created_at ASC LIMIT $2
  `, [conversationId, limit]);
  return rows;
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  const now = Date.now();
  await pool.query(`
    UPDATE messages SET is_read = 1, read_at = $1
    WHERE conversation_id = $2 AND sender_id != $3 AND is_read = 0
  `, [now, conversationId, userId]);
}

export async function getMessageReactions(messageId: string): Promise<DBMessageReaction[]> {
  const { rows } = await pool.query('SELECT * FROM message_reactions WHERE message_id = $1', [messageId]);
  return rows;
}

export async function addMessageReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  const id = uuidv4();
  const now = Date.now();
  await pool.query(`
    INSERT INTO message_reactions (id, message_id, user_id, emoji, created_at)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (message_id, user_id, emoji) DO UPDATE SET created_at = $5
  `, [id, messageId, userId, emoji, now]);
}

export async function removeMessageReaction(messageId: string, userId: string, emoji: string): Promise<void> {
  await pool.query('DELETE FROM message_reactions WHERE message_id = $1 AND user_id = $2 AND emoji = $3', [messageId, userId, emoji]);
}

// Like operations
export async function addLike(userId: string, targetId: string): Promise<void> {
  const now = Date.now();
  await pool.query(
    'INSERT INTO likes (user_id, target_id, created_at) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
    [userId, targetId, now]
  );
}

export async function getLikesByUser(userId: string): Promise<DBLike[]> {
  const { rows } = await pool.query('SELECT * FROM likes WHERE user_id = $1', [userId]);
  return rows;
}

export async function getLikedByUsers(targetId: string): Promise<DBLike[]> {
  const { rows } = await pool.query('SELECT * FROM likes WHERE target_id = $1', [targetId]);
  return rows;
}

// Match operations
export async function createMatch(user1Id: string, user2Id: string): Promise<DBMatch | null> {
  const { rows: existing } = await pool.query(`
    SELECT * FROM matches
    WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
  `, [user1Id, user2Id]);

  if (existing[0]) return existing[0];

  const id = uuidv4();
  const now = Date.now();

  await pool.query('INSERT INTO matches (id, user1_id, user2_id, created_at) VALUES ($1, $2, $3, $4)', [id, user1Id, user2Id, now]);

  await createConversation([user1Id, user2Id]);

  return { id, user1_id: user1Id, user2_id: user2Id, created_at: now };
}

export async function getUserMatches(userId: string): Promise<DBMatch[]> {
  const { rows } = await pool.query('SELECT * FROM matches WHERE user1_id = $1 OR user2_id = $1', [userId]);
  return rows;
}

export async function checkMutualLike(userId: string, targetId: string): Promise<boolean> {
  const { rows: like1 } = await pool.query('SELECT 1 FROM likes WHERE user_id = $1 AND target_id = $2', [userId, targetId]);
  const { rows: like2 } = await pool.query('SELECT 1 FROM likes WHERE user_id = $1 AND target_id = $2', [targetId, userId]);
  return like1.length > 0 && like2.length > 0;
}

// Admin statistics
export async function getStats() {
  const { rows: userCountRows } = await pool.query('SELECT COUNT(*) as count FROM users');
  const { rows: conversationCountRows } = await pool.query('SELECT COUNT(*) as count FROM conversations');
  const { rows: messageCountRows } = await pool.query('SELECT COUNT(*) as count FROM messages');
  const { rows: matchCountRows } = await pool.query('SELECT COUNT(*) as count FROM matches');

  const { rows: recentUsers } = await pool.query(`
    SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 5
  `);

  const { rows: recentMessages } = await pool.query(`
    SELECT m.*, u.name as sender_name FROM messages m
    JOIN users u ON m.sender_id = u.id
    ORDER BY m.created_at DESC LIMIT 10
  `);

  return {
    userCount: parseInt(userCountRows[0].count),
    conversationCount: parseInt(conversationCountRows[0].count),
    messageCount: parseInt(messageCountRows[0].count),
    matchCount: parseInt(matchCountRows[0].count),
    recentUsers,
    recentMessages,
  };
}

export async function verifyPassword(email: string, password: string): Promise<DBUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) return null;

  return user;
}

export async function updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
  const now = Date.now();
  await pool.query('UPDATE users SET is_online = $1, last_seen = $2 WHERE id = $3', [isOnline ? 1 : 0, now, userId]);
}

export async function deleteUserCascade(id: string): Promise<void> {
  await pool.query('DELETE FROM message_reactions WHERE user_id = $1', [id]);
  await pool.query('DELETE FROM messages WHERE sender_id = $1', [id]);
  await pool.query('DELETE FROM conversation_participants WHERE user_id = $1', [id]);
  await pool.query('DELETE FROM likes WHERE user_id = $1 OR target_id = $1', [id]);
  await pool.query('DELETE FROM matches WHERE user1_id = $1 OR user2_id = $1', [id]);

  const { rows: conversations } = await pool.query(`
    SELECT DISTINCT conversation_id FROM conversation_participants
    WHERE conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE user_id = $1
    )
  `, [id]);

  for (const conv of conversations) {
    const participants = await getConversationParticipants(conv.conversation_id);
    if (participants.length <= 1) {
      await pool.query('DELETE FROM messages WHERE conversation_id = $1', [conv.conversation_id]);
      await pool.query('DELETE FROM conversation_participants WHERE conversation_id = $1', [conv.conversation_id]);
      await pool.query('DELETE FROM conversations WHERE id = $1', [conv.conversation_id]);
    }
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

export async function getUnreadCount(conversationId: string, userId: string): Promise<number> {
  const { rows } = await pool.query(`
    SELECT COUNT(*) as count FROM messages
    WHERE conversation_id = $1 AND sender_id != $2 AND is_read = 0
  `, [conversationId, userId]);
  return parseInt(rows[0].count);
}

// Post operations
export async function createPost(userId: string, content: string, image?: string): Promise<DBPost> {
  const id = uuidv4();
  const now = Date.now();

  await pool.query(
    `INSERT INTO posts (id, user_id, content, image, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, userId, content, image || null, now, now]
  );

  return { id, user_id: userId, content, image: image || null, likes_count: 0, comments_count: 0, created_at: now, updated_at: now };
}

export async function getPosts(limit: number = 20, offset: number = 0): Promise<any[]> {
  const { rows } = await pool.query(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);
  return rows;
}

export async function getPostById(id: string): Promise<any | null> {
  const { rows } = await pool.query(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
  `, [id]);
  return rows[0] || null;
}

export async function deletePost(id: string): Promise<void> {
  await pool.query('DELETE FROM comments WHERE post_id = $1', [id]);
  await pool.query('DELETE FROM post_likes WHERE post_id = $1', [id]);
  await pool.query('DELETE FROM posts WHERE id = $1', [id]);
}

export async function createComment(postId: string, userId: string, content: string): Promise<DBComment> {
  const id = uuidv4();
  const now = Date.now();

  await pool.query(
    `INSERT INTO comments (id, post_id, user_id, content, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, postId, userId, content, now]
  );

  await pool.query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);

  return { id, post_id: postId, user_id: userId, content, created_at: now };
}

export async function getPostComments(postId: string): Promise<any[]> {
  const { rows } = await pool.query(`
    SELECT c.*, u.name as author_name, u.avatar as author_avatar
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `, [postId]);
  return rows;
}

export async function deleteComment(id: string): Promise<void> {
  const { rows: comment } = await pool.query('SELECT post_id FROM comments WHERE id = $1', [id]);
  if (comment[0]) {
    await pool.query('UPDATE posts SET comments_count = comments_count - 1 WHERE id = $1', [comment[0].post_id]);
  }
  await pool.query('DELETE FROM comments WHERE id = $1', [id]);
}

export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
  const { rows: existing } = await pool.query('SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);

  if (existing.length > 0) {
    await pool.query('DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    await pool.query('UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1', [postId]);
    return false;
  } else {
    const now = Date.now();
    await pool.query('INSERT INTO post_likes (post_id, user_id, created_at) VALUES ($1, $2, $3)', [postId, userId, now]);
    await pool.query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
    return true;
  }
}

export async function isPostLiked(postId: string, userId: string): Promise<boolean> {
  const { rows } = await pool.query('SELECT 1 FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
  return rows.length > 0;
}

export async function getUserPosts(userId: string): Promise<any[]> {
  const { rows } = await pool.query(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM posts p
    JOIN users u ON p.user_id = u.id
    WHERE p.user_id = $1
    ORDER BY p.created_at DESC
  `, [userId]);
  return rows;
}

export async function togglePostBookmark(postId: string, userId: string): Promise<boolean> {
  const { rows: existing } = await pool.query('SELECT 1 FROM post_bookmarks WHERE post_id = $1 AND user_id = $2', [postId, userId]);
  if (existing.length > 0) {
    await pool.query('DELETE FROM post_bookmarks WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    return false;
  } else {
    await pool.query('INSERT INTO post_bookmarks (post_id, user_id, created_at) VALUES ($1, $2, $3)', [postId, userId, Date.now()]);
    return true;
  }
}

export async function isPostBookmarked(postId: string, userId: string): Promise<boolean> {
  const { rows } = await pool.query('SELECT 1 FROM post_bookmarks WHERE post_id = $1 AND user_id = $2', [postId, userId]);
  return rows.length > 0;
}

export async function getUserBookmarks(userId: string): Promise<any[]> {
  const { rows } = await pool.query(`
    SELECT p.*, u.name as author_name, u.avatar as author_avatar
    FROM post_bookmarks pb
    JOIN posts p ON pb.post_id = p.id
    JOIN users u ON p.user_id = u.id
    WHERE pb.user_id = $1
    ORDER BY pb.created_at DESC
  `, [userId]);
  return rows;
}

export default pool;
