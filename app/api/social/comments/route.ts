import { NextRequest, NextResponse } from 'next/server';
import { getPostComments, createComment, deleteComment, getPostById } from '@/lib/sqlite';
import { AI_PERSONAS } from '@/lib/ai-personas';

export async function GET(req: NextRequest) {
  try {
    const postId = req.nextUrl.searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: '缺少帖子ID' }, { status: 400 });
    }

    const comments = await getPostComments(postId);
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: '获取评论失败' }, { status: 500 });
  }
}

const AI_REPLY_TEMPLATES: Record<string, string[]> = {
  'ai-xiaomei': [
    '谢谢你的评论！嘻嘻～🧋',
    '哇，你说的太对了！我们想法一样呢～',
    '哈哈，你真有趣！想和你聊聊～',
    '对呀对呀！超级赞同的！',
    '谢谢你的支持！好开心呀～',
    '你也喜欢吗？太好了！下次一起呀～',
    '嗯嗯！我也是这么想的呢！',
  ],
  'ai-zhihui': [
    '感谢你的分享，很有见地。',
    '确实如此，值得深入思考。',
    '有道理，我也有类似的感受。',
    '谢谢你的评论，很有启发。',
    '认同你的观点，感谢交流。',
    '这个问题我也思考过，你的角度很新颖。',
    '说得不错，继续交流～',
  ],
  'ai-wanwan': [
    '谢谢你的喜欢！好开心呀～🎨',
    '你的评论让我今天心情更好了！',
    '嗯嗯！艺术的魅力就在于此呢～',
    '谢谢你的支持！会继续努力的！',
    '你的鼓励是我最大的动力！',
    '改天一起去逛展吧！',
    '谢谢！你的品味也很好呢～',
  ],
  'ai-tiantian': [
    '谢谢！你也来试试呀～🍲',
    '哈哈，你也爱吃！我们可以一起去！',
    '对呀！好吃的东西就是要分享！',
    '谢谢你的评论！好开心～',
    '下次一起去吃呀！我请客！',
    '你的推荐也很棒！记下了！',
    '吃货的快乐就是这么简单！',
  ],
  'ai-qingqing': [
    '谢谢你的关注！🧘‍♀️',
    '嗯嗯！健康真的很重要呢～',
    '你的鼓励让我更有动力了！',
    '谢谢！一起保持好心情～',
    '对呀！身心合一才是最重要的！',
    '感谢你的分享，很温暖～',
    '保持运动，保持好心情！',
  ],
  'ai-yoyo': [
    '谢谢你的评论！✈️',
    '你的分享也很有趣呢！',
    '哈哈，下次一起去吧！',
    '旅行的乐趣就在于分享～',
    '谢谢！你的经历也很精彩！',
    '对呀！世界那么大，一起去看看！',
    '期待下次的旅行分享～',
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { postId, userId, content } = await req.json();

    if (!postId || !userId || !content) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const comment = await createComment(postId, userId, content);

    let aiReply = null;
    try {
      const post = await getPostById(postId);
      if (post && post.user_id.startsWith('ai-') && !userId.startsWith('ai-')) {
        const persona = AI_PERSONAS.find(p => p.id === post.user_id);
        if (persona) {
          const templates = AI_REPLY_TEMPLATES[persona.id] || AI_REPLY_TEMPLATES['ai-xiaomei'];
          const replyContent = templates[Math.floor(Math.random() * templates.length)];
          const delay = Math.floor(Math.random() * 2000) + 1000;
          setTimeout(async () => {
            try {
              await createComment(postId, persona.id, replyContent);
            } catch (e) {
              console.error('AI auto reply failed:', e);
            }
          }, delay);
          aiReply = { personaName: persona.name, delay };
        }
      }
    } catch (e) {
      console.error('AI reply trigger error:', e);
    }

    return NextResponse.json({ ...comment, aiReply });
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

    await deleteComment(commentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
