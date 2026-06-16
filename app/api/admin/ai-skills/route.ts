import { NextRequest, NextResponse } from 'next/server';
import { getAllSkills, createSkill, updateSkill, deleteSkill } from '@/lib/ai-skills';

export async function GET() {
  return NextResponse.json(getAllSkills());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  if (!body.name || !body.systemPrompt) {
    return NextResponse.json({ error: 'Name and systemPrompt are required' }, { status: 400 });
  }
  
  const newSkill = createSkill({
    name: body.name,
    description: body.description || '',
    systemPrompt: body.systemPrompt,
    responseStyle: body.responseStyle || 'cute',
    greetingTemplate: body.greetingTemplate || '你好呀~',
    personalityTraits: body.personalityTraits || [],
    conversationStarters: body.conversationStarters || [],
    responseTemplates: body.responseTemplates || { default: ['嗯嗯~'] },
  });
  
  return NextResponse.json(newSkill);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  
  if (!body.id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  
  const updated = updateSkill(body.id, body);
  
  if (!updated) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }
  
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }
  
  const success = deleteSkill(id);
  
  if (!success) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}