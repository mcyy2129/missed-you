import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, getUserConversations, getConversationMessages, getConversationParticipants } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (userId) {
      const conversations = await getUserConversations(userId);
      const enrichedConversations = [];
      for (const conv of conversations) {
        const participants = await getConversationParticipants(conv.id);
        const messages = await getConversationMessages(conv.id, 1);
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const allMessages = await getConversationMessages(conv.id, 1000);

        enrichedConversations.push({
          ...conv,
          participants,
          lastMessage,
          messageCount: allMessages.length,
        });
      }
      return NextResponse.json(enrichedConversations);
    }

    const users = await getAllUsers();
    const allConversations: any[] = [];

    for (const user of users.slice(0, 50)) {
      const userConvs = await getUserConversations(user.id);
      for (const conv of userConvs) {
        if (!allConversations.find(c => c.id === conv.id)) {
          const participants = await getConversationParticipants(conv.id);
          const messages = await getConversationMessages(conv.id, 1);
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          const allMessages = await getConversationMessages(conv.id, 1000);

          allConversations.push({
            ...conv,
            participants,
            lastMessage,
            messageCount: allMessages.length,
          });
        }
      }
    }

    allConversations.sort((a, b) => b.updated_at - a.updated_at);

    return NextResponse.json(allConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json({ error: '获取对话列表失败' }, { status: 500 });
  }
}
