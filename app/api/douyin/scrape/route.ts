import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const FETCH_TIMEOUT = 8000;

function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function resolveShareUrl(shareUrl: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(shareUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Cookie': 'ttwid=1',
      },
    });
    const finalUrl = res.url;
    if (finalUrl.includes('/video/')) return finalUrl;
    const html = await res.text();
    const match = html.match(/https?:\/\/[^"'\s]+\/video\/\d+/);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

function extractVideoId(url: string): string | null {
  const match = url.match(/\/video\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchDouyinVideoInfo(videoId: string): Promise<any> {
  try {
    const res = await fetchWithTimeout(
      `https://www.douyin.com/aweme/v1/web/aweme/detail/?aweme_id=${videoId}&aid=6383&cookie_enabled=true&platform=PC`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.douyin.com/',
        },
      }
    );
    const data = await res.json();
    return data.aweme_detail || null;
  } catch {
    return null;
  }
}

function parseVideoUrl(url: string): { videoId: string; isDirect: boolean } | null {
  const directMatch = url.match(/douyin\.com\/video\/(\d+)/);
  if (directMatch) return { videoId: directMatch[1], isDirect: true };

  const shortMatch = url.match(/v\.douyin\.com\/(\w+)/);
  if (shortMatch) return { videoId: shortMatch[1], isDirect: false };

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, urls } = body;

    const inputUrls: string[] = urls || (url ? [url] : []);
    if (inputUrls.length === 0) {
      return NextResponse.json({ error: '请提供抖音链接' }, { status: 400 });
    }

    if (inputUrls.length > 20) {
      return NextResponse.json({ error: '单次最多抓取20个' }, { status: 400 });
    }

    const results = [];
    const errors = [];
    const now = Date.now();

    for (const inputUrl of inputUrls) {
      try {
        const trimmed = inputUrl.trim();
        const parsed = parseVideoUrl(trimmed);

        let videoId: string | null = null;

        if (parsed?.isDirect) {
          videoId = parsed.videoId;
        } else if (parsed) {
          const resolved = await resolveShareUrl(trimmed);
          if (resolved) {
            videoId = extractVideoId(resolved);
          }
        } else {
          videoId = extractVideoId(trimmed);
        }

        if (!videoId) {
          errors.push({ url: trimmed, error: '无法提取视频ID，请使用直接视频链接（含/video/数字）' });
          continue;
        }

        const existing = await pool.query('SELECT id FROM douyin_videos WHERE source_video_id = $1', [videoId]);
        if (existing.rows.length > 0) {
          errors.push({ url: trimmed, error: '视频已存在' });
          continue;
        }

        const detail = await fetchDouyinVideoInfo(videoId);
        if (!detail) {
          const fallbackUrl = `https://www.douyin.com/video/${videoId}`;
          const id = uuidv4();
          await pool.query(
            `INSERT INTO douyin_videos (id, title, description, video_url, cover_url, author_name, author_avatar, category, duration, music_name, music_author, digg_count, comment_count, share_count, status, source_url, source_video_id, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
            [id, `抖音视频 ${videoId}`, '', fallbackUrl, '', '抖音用户', '', '推荐', 15, '', '', 0, 0, 0, 'active', trimmed, videoId, now, now]
          );
          results.push({ id, title: `抖音视频 ${videoId}`, author: '抖音用户', note: '视频信息待补充' });
          continue;
        }

        const video = detail.video || {};
        const author = detail.author || {};
        const stats = detail.statistics || {};
        const music = detail.music || {};

        const id = uuidv4();
        await pool.query(
          `INSERT INTO douyin_videos (id, title, description, video_url, cover_url, author_name, author_avatar, category, duration, music_name, music_author, digg_count, comment_count, share_count, status, source_url, source_video_id, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
          [
            id,
            detail.desc || `抖音视频 ${videoId}`,
            detail.desc || '',
            video.play_addr?.url_list?.[0] || `https://www.douyin.com/video/${videoId}`,
            video.cover?.url_list?.[0] || video.origin_cover?.url_list?.[0] || '',
            author.nickname || '抖音用户',
            author.avatar_thumb?.url_list?.[0] || '',
            '推荐',
            Math.round((video.duration || 0) / 1000) || 15,
            music.title || '',
            music.author || '',
            stats.digg_count || 0,
            stats.comment_count || 0,
            stats.share_count || 0,
            'active',
            trimmed,
            videoId,
            now,
            now,
          ]
        );

        results.push({ id, title: detail.desc || `抖音视频 ${videoId}`, author: author.nickname || '抖音用户' });
      } catch (e: any) {
        errors.push({ url: inputUrl, error: e.message || '抓取失败' });
      }
    }

    return NextResponse.json({
      success: true,
      total: inputUrls.length,
      imported: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error('Douyin scrape error:', error);
    return NextResponse.json({ error: '抓取失败' }, { status: 500 });
  }
}
