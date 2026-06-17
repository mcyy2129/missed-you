import { NextRequest, NextResponse } from 'next/server';
import { createConversation, findConversationBetweenUsers, getUserConversations, getConversationParticipants, getConversationMessages } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const conversations = await getUserConversations(userId);
    const enrichedConversations = [];
    for (const conv of conversations) {
      const participants = await getConversationParticipants(conv.id);
      const messages = await getConversationMessages(conv.id, 1);
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

      enrichedConversations.push({
        id: conv.id,
        participants,
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          senderId: lastMessage.sender_id,
          text: lastMessage.text,
          timestamp: lastMessage.created_at,
        } : null,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      });
    }

    return NextResponse.json(enrichedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: '获取对话列表失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantIds } = body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const existing = await findConversationBetweenUsers(participantIds[0], participantIds[1]);
    if (existing) {
      const participants = await getConversationParticipants(existing.id);
      return NextResponse.json({
        id: existing.id,
        participants,
        createdAt: existing.created_at,
        updatedAt: existing.updated_at,
      });
    }

    const conversation = await createConversation(participantIds);
    const participants = await getConversationParticipants(conversation.id);

    return NextResponse.json({
      id: conversation.id,
      participants,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    return NextResponse.json({ error: '创建对话失败' }, { status: 500 });
  }
}
