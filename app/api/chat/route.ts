import { NextRequest, NextResponse } from 'next/server';
import { getAIReply, ChatMessage } from '@/lib/ai';
import { AI_PERSONAS } from '@/lib/ai-personas';

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile, personaId } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ reply: '请输入消息', isFallback: true }, { status: 400 });
    }

    let persona = undefined;
    if (personaId) {
      persona = AI_PERSONAS.find(p => p.id === personaId) || undefined;
    }

    const profile = persona ? {
      name: persona.name,
      age: persona.age,
      city: persona.city,
      interests: persona.interests,
      bio: persona.bio,
      personality: persona.personality,
    } : (userProfile || { name: '用户', age: 25, city: '北京', interests: [], bio: '' });

    const reply = await getAIReply(messages as ChatMessage[], profile, persona);
    const isFallback = !process.env.NVIDIA_API_KEY;
    
    return NextResponse.json({ reply, isFallback, personaId: persona?.id });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ reply: '抱歉，出了点问题~', isFallback: true }, { status: 500 });
  }
}
