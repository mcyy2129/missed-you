import { NextRequest, NextResponse } from 'next/server';
import { getPostComments, createComment, deleteComment } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: '缺少帖子ID' }, { status: 400 });
    }

    const comments = getPostComments(postId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { postId, userId, content } = await req.json();

    if (!postId || !userId || !content) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const comment = createComment(postId, userId, content);
    return NextResponse.json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json({ error: '评论失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { commentId } = await req.json();

    if (!commentId) {
      return NextResponse.json({ error: '缺少评论ID' }, { status: 400 });
    }

    deleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
