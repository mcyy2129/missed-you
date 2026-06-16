import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost, deletePost } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const posts = getPosts(limit, offset);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, content, image } = await req.json();

    if (!userId || !content) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const post = createPost(userId, content, image);
    return NextResponse.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json({ error: '发布失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    deletePost(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
