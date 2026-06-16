import { NextRequest, NextResponse } from 'next/server';
import { togglePostBookmark, isPostBookmarked, getUserBookmarks } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }
    const bookmarks = getUserBookmarks(userId);
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return NextResponse.json({ error: '获取收藏失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { postId, userId } = await req.json();
    if (!postId || !userId) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }
    const isBookmarked = togglePostBookmark(postId, userId);
    return NextResponse.json({ isBookmarked });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return NextResponse.json({ error: '收藏失败' }, { status: 500 });
  }
}
