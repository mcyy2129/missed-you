import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/sqlite';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const database = getDb();
    const dbPath = path.join(process.cwd(), 'data', 'missed-you.db');

    // Get database file size
    let dbSize = '0 KB';
    try {
      const stats = fs.statSync(dbPath);
      const bytes = stats.size;
      if (bytes < 1024) {
        dbSize = `${bytes} B`;
      } else if (bytes < 1024 * 1024) {
        dbSize = `${(bytes / 1024).toFixed(2)} KB`;
      } else {
        dbSize = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      }
    } catch (e) {
      console.error('Failed to get DB size:', e);
    }

    // Get table counts
    const tables = [
      'users', 'conversations', 'messages', 'matches',
      'posts', 'comments', 'likes', 'conversation_participants', 'message_reactions'
    ];

    const tableStats = tables.map(name => {
      try {
        const result = database.prepare(`SELECT COUNT(*) as count FROM ${name}`).get() as any;
        return { name, count: result.count, size: '-' };
      } catch (e) {
        return { name, count: 0, size: '-' };
      }
    });

    // Recent activity (last 24 hours)
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const recentUsers = (database.prepare(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ?'
    ).get(dayAgo) as any).count;

    const recentMessages = (database.prepare(
      'SELECT COUNT(*) as count FROM messages WHERE created_at >= ?'
    ).get(dayAgo) as any).count;

    const recentMatches = (database.prepare(
      'SELECT COUNT(*) as count FROM matches WHERE created_at >= ?'
    ).get(dayAgo) as any).count;

    const recentPosts = (database.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE created_at >= ?'
    ).get(dayAgo) as any).count;

    const recentActivity = [
      { action: '用户注册', count: recentUsers, time: '过去24小时' },
      { action: '新消息', count: recentMessages, time: '过去24小时' },
      { action: '新匹配', count: recentMatches, time: '过去24小时' },
      { action: '新帖子', count: recentPosts, time: '过去24小时' },
    ];

    return NextResponse.json({
      userCount: tableStats.find(t => t.name === 'users')?.count || 0,
      conversationCount: tableStats.find(t => t.name === 'conversations')?.count || 0,
      messageCount: tableStats.find(t => t.name === 'messages')?.count || 0,
      matchCount: tableStats.find(t => t.name === 'matches')?.count || 0,
      postCount: tableStats.find(t => t.name === 'posts')?.count || 0,
      commentCount: tableStats.find(t => t.name === 'comments')?.count || 0,
      dbSize,
      tableStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Get database stats error:', error);
    return NextResponse.json({ error: '获取数据库统计失败' }, { status: 500 });
  }
}
