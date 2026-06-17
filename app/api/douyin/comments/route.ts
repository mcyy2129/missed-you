import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const videoId = req.nextUrl.searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: '缺少视频ID' }, { status: 400 });
    }

    const { rows } = await pool.query(
      'SELECT * FROM douyin_comments WHERE video_id = $1 ORDER BY created_at DESC',
      [videoId]
    );

    return NextResponse.json({ data: rows, code: 200 });
  } catch (error) {
    console.error('Get douyin comments error:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { video_id, author_name, author_avatar, text } = body;

    if (!video_id || !text) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const id = uuidv4();
    const now = Date.now();

    await pool.query(
      `INSERT INTO douyin_comments (id, video_id, author_name, author_avatar, text, digg_count, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, video_id, author_name || '用户', author_avatar || '', text, 0, now]
    );

    await pool.query('UPDATE douyin_videos SET comment_count = comment_count + 1 WHERE id = $1', [video_id]);

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Create douyin comment error:', error);
    return NextResponse.json({ error: '评论失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, video_id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: '缺少评论ID' }, { status: 400 });
    }

    await pool.query('DELETE FROM douyin_comments WHERE id = $1', [id]);
    if (video_id) {
      await pool.query('UPDATE douyin_videos SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1', [video_id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete douyin comment error:', error);
    return NextResponse.json({ error: '删除评论失败' }, { status: 500 });
  }
}
