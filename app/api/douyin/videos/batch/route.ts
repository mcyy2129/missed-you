import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

interface VideoInput {
  title?: string;
  description?: string;
  video_url: string;
  cover_url?: string;
  author_name?: string;
  author_avatar?: string;
  category?: string;
  duration?: number;
  music_name?: string;
  music_author?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videos } = body;

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return NextResponse.json({ error: '请提供视频数组' }, { status: 400 });
    }

    if (videos.length > 100) {
      return NextResponse.json({ error: '单次最多导入100条' }, { status: 400 });
    }

    const now = Date.now();
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const v of videos) {
      try {
        if (!v.video_url) {
          failCount++;
          errors.push(`缺少video_url: ${JSON.stringify(v).slice(0, 50)}`);
          continue;
        }

        const id = uuidv4();
        await pool.query(
          `INSERT INTO douyin_videos (id, title, description, video_url, cover_url, author_name, author_avatar, category, duration, music_name, music_author, digg_count, comment_count, share_count, status, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [
            id,
            v.title || '',
            v.description || '',
            v.video_url,
            v.cover_url || '',
            v.author_name || '用户',
            v.author_avatar || '',
            v.category || '推荐',
            v.duration || 15,
            v.music_name || '',
            v.music_author || '',
            0, 0, 0,
            'active',
            now,
            now,
          ]
        );
        successCount++;
      } catch (e: any) {
        failCount++;
        errors.push(e.message || '插入失败');
      }
    }

    return NextResponse.json({
      success: true,
      total: videos.length,
      successCount,
      failCount,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Batch import error:', error);
    return NextResponse.json({ error: '批量导入失败' }, { status: 500 });
  }
}
