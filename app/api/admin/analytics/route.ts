import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';

    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const now = Date.now();
    const startTime = now - days * 24 * 60 * 60 * 1000;

    const dailyStats = [];
    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const date = new Date(dayEnd).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

      const { rows: messages } = await pool.query(
        'SELECT COUNT(*) as count FROM messages WHERE created_at >= $1 AND created_at < $2',
        [dayStart, dayEnd]
      );

      const { rows: matches } = await pool.query(
        'SELECT COUNT(*) as count FROM matches WHERE created_at >= $1 AND created_at < $2',
        [dayStart, dayEnd]
      );

      const { rows: activeUsers } = await pool.query(
        'SELECT COUNT(DISTINCT sender_id) as count FROM messages WHERE created_at >= $1 AND created_at < $2',
        [dayStart, dayEnd]
      );

      dailyStats.push({ date, messages: parseInt(messages[0].count), matches: parseInt(matches[0].count), activeUsers: parseInt(activeUsers[0].count) });
    }

    const hourlyActivity = [];
    for (let h = 0; h < 24; h++) {
      const hourStart = new Date();
      hourStart.setHours(h, 0, 0, 0);
      const hourEnd = new Date();
      hourEnd.setHours(h + 1, 0, 0, 0);

      const { rows: messages } = await pool.query(
        'SELECT COUNT(*) as count FROM messages WHERE created_at >= $1 AND created_at < $2',
        [hourStart.getTime(), hourEnd.getTime()]
      );

      hourlyActivity.push({ hour: `${h}:00`, messages: parseInt(messages[0].count) });
    }

    const userGrowth = [];
    const { rows: initialCount } = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at < $1',
      [startTime]
    );
    let cumulativeCount = parseInt(initialCount[0].count);

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const date = new Date(dayEnd).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

      const { rows: newUsers } = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND created_at < $2',
        [dayStart, dayEnd]
      );

      cumulativeCount += parseInt(newUsers[0].count);
      userGrowth.push({ date, count: cumulativeCount });
    }

    const { rows: totalLikes } = await pool.query('SELECT COUNT(*) as count FROM likes');
    const { rows: totalMatches } = await pool.query('SELECT COUNT(*) as count FROM matches');

    const { rows: topCities } = await pool.query(`
      SELECT city as name, COUNT(*) as value FROM users
      WHERE city != '' GROUP BY city ORDER BY value DESC LIMIT 5
    `);

    const { rows: totalConversations } = await pool.query('SELECT COUNT(*) as count FROM conversations');
    const { rows: activeConversations } = await pool.query(
      'SELECT COUNT(DISTINCT conversation_id) as count FROM messages WHERE created_at >= $1',
      [startTime]
    );

    const avgMessagesPerDay = Math.round(dailyStats.reduce((sum, d) => sum + d.messages, 0) / days);
    const avgActiveUsers = Math.round(dailyStats.reduce((sum, d) => sum + d.activeUsers, 0) / days);

    const { rows: topActiveUsers } = await pool.query(`
      SELECT u.name, COUNT(m.id) as messageCount
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.created_at >= $1
      GROUP BY m.sender_id, u.name
      ORDER BY messageCount DESC
      LIMIT 5
    `, [startTime]);

    return NextResponse.json({
      dailyStats,
      hourlyActivity,
      userGrowth,
      matchRate: { total: parseInt(totalLikes[0].count), mutual: parseInt(totalMatches[0].count) },
      topCities,
      summary: {
        totalConversations: parseInt(totalConversations[0].count),
        activeConversations: parseInt(activeConversations[0].count),
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
