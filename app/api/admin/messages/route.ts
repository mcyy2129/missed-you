import { NextRequest, NextResponse } from 'next/server';
import { getConversationMessages, getUserById } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: '缺少对话ID' }, { status: 400 });
    }

    const messages = await getConversationMessages(conversationId, 100);

    const enrichedMessages = [];
    for (const msg of messages) {
      const sender = await getUserById(msg.sender_id);
      enrichedMessages.push({
        ...msg,
        sender_name: sender?.name || '未知用户',
        sender_avatar: sender?.avatar || '',
      });
    }

    return NextResponse.json(enrichedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: '获取消息列表失败' }, { status: 500 });
  }
}
