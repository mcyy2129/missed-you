import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetUserId, action } = body;
    const userId = req.headers.get('x-user-id');

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    if (action === 'follow') {
      const { rows: existing } = await pool.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [userId, targetUserId]
      );

      if (existing.length === 0) {
        await pool.query(
          'INSERT INTO follows (id, follower_id, following_id, created_at) VALUES ($1, $2, $3, $4)',
          [`${userId}-${targetUserId}-${Date.now()}`, userId, targetUserId, Date.now()]
        );
      }
    } else if (action === 'unfollow') {
      await pool.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [userId, targetUserId]
      );
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

    const { rows: followers } = await pool.query(
      'SELECT follower_id FROM follows WHERE following_id = $1', [userId]
    );

    const { rows: following } = await pool.query(
      'SELECT following_id FROM follows WHERE follower_id = $1', [userId]
    );

    return NextResponse.json({
      followers: followers.map((r: any) => r.follower_id),
      following: following.map((r: any) => r.following_id),
    });
  } catch (error) {
    console.error('Get follows error:', error);
    return NextResponse.json({ error: '获取关注信息失败' }, { status: 500 });
  }
}
