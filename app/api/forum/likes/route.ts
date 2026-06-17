import { NextRequest, NextResponse } from 'next/server';
import { togglePostLike } from '@/lib/sqlite';

export async function POST(req: NextRequest) {
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const isLiked = await togglePostLike(postId, userId);
    return NextResponse.json({ isLiked });
  } catch (error) {
    console.error('Toggle forum like error:', error);
    return NextResponse.json({ error: '点赞失败' }, { status: 500 });
  }
}
