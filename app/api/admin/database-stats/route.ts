import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const tables = [
      'users', 'conversations', 'messages', 'matches',
      'posts', 'comments', 'likes', 'conversation_participants', 'message_reactions'
    ];

    const tableStats = [];
    for (const name of tables) {
      try {
        const { rows } = await pool.query(`SELECT COUNT(*) as count FROM ${name}`);
        tableStats.push({ name, count: parseInt(rows[0].count), size: '-' });
      } catch (e) {
        tableStats.push({ name, count: 0, size: '-' });
      }
    }

    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const { rows: recentUsers } = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= $1', [dayAgo]
    );
    const { rows: recentMessages } = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE created_at >= $1', [dayAgo]
    );
    const { rows: recentMatches } = await pool.query(
      'SELECT COUNT(*) as count FROM matches WHERE created_at >= $1', [dayAgo]
    );
    const { rows: recentPosts } = await pool.query(
      'SELECT COUNT(*) as count FROM posts WHERE created_at >= $1', [dayAgo]
    );

    const recentActivity = [
      { action: '用户注册', count: parseInt(recentUsers[0].count), time: '过去24小时' },
      { action: '新消息', count: parseInt(recentMessages[0].count), time: '过去24小时' },
      { action: '新匹配', count: parseInt(recentMatches[0].count), time: '过去24小时' },
      { action: '新帖子', count: parseInt(recentPosts[0].count), time: '过去24小时' },
    ];

    return NextResponse.json({
      userCount: tableStats.find(t => t.name === 'users')?.count || 0,
      conversationCount: tableStats.find(t => t.name === 'conversations')?.count || 0,
      messageCount: tableStats.find(t => t.name === 'messages')?.count || 0,
      matchCount: tableStats.find(t => t.name === 'matches')?.count || 0,
      postCount: tableStats.find(t => t.name === 'posts')?.count || 0,
      commentCount: tableStats.find(t => t.name === 'comments')?.count || 0,
      dbSize: 'N/A (cloud)',
      tableStats,
      recentActivity,
    });
  } catch (error) {
    console.error('Get database stats error:', error);
    return NextResponse.json({ error: '获取数据库统计失败' }, { status: 500 });
  }
}
