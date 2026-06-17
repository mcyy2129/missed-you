import { NextRequest, NextResponse } from 'next/server';
import { createMessage, getConversationMessages, markMessagesAsRead, getUserById } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get('conversationId');
    const after = req.nextUrl.searchParams.get('after');

    if (!conversationId) {
      return NextResponse.json({ error: '缺少对话ID' }, { status: 400 });
    }

    let messages = await getConversationMessages(conversationId, 100);

    if (after) {
      const afterTime = parseInt(after);
      messages = messages.filter(m => m.created_at > afterTime);
    }

    const enrichedMessages = [];
    for (const msg of messages) {
      const sender = await getUserById(msg.sender_id);
      enrichedMessages.push({
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        text: msg.text,
        image: msg.image,
        audio: msg.audio,
        timestamp: msg.created_at,
        isRead: msg.is_read === 1,
        readAt: msg.read_at,
        senderName: sender?.name || '未知用户',
        senderAvatar: sender?.avatar || '',
      });
    }

    return NextResponse.json(enrichedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: '获取消息列表失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, senderId, text, image, audio, sticker } = body;

    if (!conversationId || !senderId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const message = await createMessage(conversationId, senderId, text || '', image, audio);

    return NextResponse.json({
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      text: message.text,
      image: message.image,
      audio: message.audio,
      timestamp: message.created_at,
    });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: '发送消息失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, userId } = body;

    if (!conversationId || !userId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    await markMessagesAsRead(conversationId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark messages read error:', error);
    return NextResponse.json({ error: '标记已读失败' }, { status: 500 });
  }
}
