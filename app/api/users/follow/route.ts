import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/sqlite';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUserId, action } = body;
    const userId = req.headers.get('x-user-id');

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const database = getDb();

    if (action === 'follow') {
      const existing = database.prepare(
        'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?'
      ).get(userId, targetUserId);

      if (!existing) {
        database.prepare(
          'INSERT INTO follows (id, follower_id, following_id, created_at) VALUES (?, ?, ?, ?)'
        ).run(`${userId}-${targetUserId}-${Date.now()}`, userId, targetUserId, Date.now());
      }
    } else if (action === 'unfollow') {
      database.prepare(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?'
      ).run(userId, targetUserId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const database = getDb();
    
    const followers = database.prepare(
      'SELECT follower_id FROM follows WHERE following_id = ?'
    ).all(userId).map((r: any) => r.follower_id);

    const following = database.prepare(
      'SELECT following_id FROM follows WHERE follower_id = ?'
    ).all(userId).map((r: any) => r.following_id);

    return NextResponse.json({ followers, following });
  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json({ error: '获取关注信息失败' }, { status: 500 });
  }
}
