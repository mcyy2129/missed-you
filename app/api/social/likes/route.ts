import { NextRequest, NextResponse } from 'next/server';
import { togglePostLike, isPostLiked } from '@/lib/sqlite';

export async function POST(req: NextRequest) {
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const isLiked = togglePostLike(postId, userId);
    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error('Toggle like error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get('postId');
    const userId = req.nextUrl.searchParams.get('userId');

    if (!postId || !userId) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const isLiked = isPostLiked(postId, userId);
    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error('Check like error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
