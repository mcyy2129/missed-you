import { NextRequest, NextResponse } from 'next/server';
import { AI_PERSONAS, AIPersona } from '@/lib/ai-personas';
import fs from 'fs';
import path from 'path';

const PERSONAS_FILE = path.join(process.cwd(), 'data', 'personas.json');

function loadPersonas(): AIPersona[] {
  try {
    if (fs.existsSync(PERSONAS_FILE)) {
      const data = fs.readFileSync(PERSONAS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load personas:', e);
  }
  return [...AI_PERSONAS];
}

function savePersonas(personas: AIPersona[]) {
  try {
    const dir = path.dirname(PERSONAS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PERSONAS_FILE, JSON.stringify(personas, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save personas:', e);
  }
}

let personas = loadPersonas();

export async function GET() {
  return NextResponse.json(personas);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const skillIds = body.skillIds || (body.skillId ? [body.skillId] : ['skill-cute']);
  const newPersona: AIPersona = {
    id: `ai-${Date.now()}`,
    name: body.name || '新角色',
    age: body.age || 25,
    city: body.city || '北京',
    bio: body.bio || '',
    interests: body.interests || [],
    personality: body.personality || '',
    greeting: body.greeting || '你好呀~',
    avatar: body.avatar || 'https://i.pravatar.cc/300?img=1',
    skillId: skillIds[0] || 'skill-cute',
    skillIds: skillIds,
  };
  personas.push(newPersona);
  savePersonas(personas);
  return NextResponse.json(newPersona);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const index = personas.findIndex(p => p.id === body.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
  }
  personas[index] = { ...personas[index], ...body };
  savePersonas(personas);
  return NextResponse.json(personas[index]);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  personas = personas.filter(p => p.id !== id);
  savePersonas(personas);
  return NextResponse.json({ success: true });
}
