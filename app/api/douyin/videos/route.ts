import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const category = req.nextUrl.searchParams.get('category');

    let query = 'SELECT * FROM douyin_videos WHERE status = $1';
    const params: any[] = ['active'];

    if (category && category !== 'all') {
      query += ' AND category = $2';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    const countQuery = category && category !== 'all'
      ? 'SELECT COUNT(*) as total FROM douyin_videos WHERE status = $1 AND category = $2'
      : 'SELECT COUNT(*) as total FROM douyin_videos WHERE status = $1';
    const countParams = category && category !== 'all' ? ['active', category] : ['active'];
    const { rows: countRows } = await pool.query(countQuery, countParams);

    return NextResponse.json({
      data: {
        total: parseInt(countRows[0].total),
        list: rows,
      },
      code: 200,
    });
  } catch (error) {
    console.error('Get douyin videos error:', error);
    return NextResponse.json({ error: '获取视频列表失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, video_url, cover_url, author_name, author_avatar, category, duration, music_name, music_author } = body;

    if (!video_url) {
      return NextResponse.json({ error: '缺少视频URL' }, { status: 400 });
    }

    const id = uuidv4();
    const now = Date.now();

    await pool.query(
      `INSERT INTO douyin_videos (id, title, description, video_url, cover_url, author_name, author_avatar, category, duration, music_name, music_author, digg_count, comment_count, share_count, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [id, title || '', description || '', video_url, cover_url || '', author_name || '用户', author_avatar || '', category || '推荐', duration || 15, music_name || '', music_author || '', 0, 0, 0, 'active', now, now]
    );

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Create douyin video error:', error);
    return NextResponse.json({ error: '创建视频失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: '缺少视频ID' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        updates.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: '没有要更新的字段' }, { status: 400 });
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(Date.now());
    values.push(id);

    await pool.query(`UPDATE douyin_videos SET ${updates.join(', ')} WHERE id = $${paramIndex}`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update douyin video error:', error);
    return NextResponse.json({ error: '更新视频失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: '缺少视频ID' }, { status: 400 });
    }

    await pool.query('DELETE FROM douyin_videos WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete douyin video error:', error);
    return NextResponse.json({ error: '删除视频失败' }, { status: 500 });
  }
}
