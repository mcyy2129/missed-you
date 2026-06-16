import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';
    const database = getDb();

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const date = new Date(dayEnd).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

      const messages = (database.prepare(
        'SELECT COUNT(*) as count FROM messages WHERE created_at >= ? AND created_at < ?'
      ).get(dayStart, dayEnd) as any).count;

      const matches = (database.prepare(
        'SELECT COUNT(*) as count FROM matches WHERE created_at >= ? AND created_at < ?'
      ).get(dayStart, dayEnd) as any).count;

      const activeUsers = (database.prepare(
        'SELECT COUNT(DISTINCT sender_id) as count FROM messages WHERE created_at >= ? AND created_at < ?'
      ).get(dayStart, dayEnd) as any).count;

      dailyStats.push({ date, messages, matches, activeUsers });
    }

    const hourlyActivity = [];
    for (let h = 0; h < 24; h++) {
      const hourStart = new Date();
      hourStart.setHours(h, 0, 0, 0);
      const hourEnd = new Date();
      hourEnd.setHours(h + 1, 0, 0, 0);

      const messages = (database.prepare(
        'SELECT COUNT(*) as count FROM messages WHERE created_at >= ? AND created_at < ?'
      ).get(hourStart.getTime(), hourEnd.getTime()) as any).count;

      hourlyActivity.push({ hour: `${h}:00`, messages });
    }

    const userGrowth = [];
    let cumulativeCount = (database.prepare(
      'SELECT COUNT(*) as count FROM users WHERE created_at < ?'
    ).get(startTime) as any).count;

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const date = new Date(dayEnd).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

      const newUsers = (database.prepare(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= ? AND created_at < ?'
      ).get(dayStart, dayEnd) as any).count;

      cumulativeCount += newUsers;
      userGrowth.push({ date, count: cumulativeCount });
    }

    const totalLikes = (database.prepare('SELECT COUNT(*) as count FROM likes').get() as any).count;
    const totalMatches = (database.prepare('SELECT COUNT(*) as count FROM matches').get() as any).count;

    const topCities = database.prepare(`
      SELECT city as name, COUNT(*) as value FROM users 
      WHERE city != '' GROUP BY city ORDER BY value DESC LIMIT 5
    `).all();

    const totalConversations = (database.prepare('SELECT COUNT(*) as count FROM conversations').get() as any).count;
    const activeConversations = (database.prepare(
      'SELECT COUNT(DISTINCT conversation_id) as count FROM messages WHERE created_at >= ?'
    ).get(startTime) as any).count;

    const avgMessagesPerDay = Math.round(dailyStats.reduce((sum, d) => sum + d.messages, 0) / days);
    const avgActiveUsers = Math.round(dailyStats.reduce((sum, d) => sum + d.activeUsers, 0) / days);

    const topActiveUsers = database.prepare(`
      SELECT u.name, COUNT(m.id) as messageCount 
      FROM messages m 
      JOIN users u ON m.sender_id = u.id 
      WHERE m.created_at >= ?
      GROUP BY m.sender_id 
      ORDER BY messageCount DESC 
      LIMIT 5
    `).all(startTime);

    return NextResponse.json({
      dailyStats,
      hourlyActivity,
      userGrowth,
      matchRate: { total: totalLikes, mutual: totalMatches },
      topCities,
      summary: {
        totalConversations,
        activeConversations,
        avgMessagesPerDay,
        avgActiveUsers,
        topActiveUsers,
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json({ error: '获取分析数据失败' }, { status: 500 });
  }
}
