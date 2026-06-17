import { NextRequest, NextResponse } from 'next/server';
import { getPosts, createPost, deletePost, togglePostLike, isPostLiked } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const category = req.nextUrl.searchParams.get('category');
    const userId = req.nextUrl.searchParams.get('userId');

    let posts = await getPosts(limit, offset);

    if (category && category !== 'all') {
      posts = posts.filter((p: any) => p.category === category);
    }

    if (userId) {
      const postsWithLike = [];
      for (const p of posts) {
        const liked = await isPostLiked(p.id, userId);
        postsWithLike.push({ ...p, isLiked: liked });
      }
      posts = postsWithLike;
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get forum posts error:', error);
    return NextResponse.json({ error: '获取帖子失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, content, image, title, category } = await req.json();

    if (!userId || !content) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const post = await createPost(userId, content, image);
    return NextResponse.json({ ...post, title, category });
  } catch (error) {
    console.error('Create forum post error:', error);
    return NextResponse.json({ error: '发布失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { postId, userId } = await req.json();

    if (!postId || !userId) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    await deletePost(postId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete forum post error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
