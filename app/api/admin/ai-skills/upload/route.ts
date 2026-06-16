import { NextRequest, NextResponse } from 'next/server';
import { createSkillFromUploadedFile } from '@/lib/ai-skills';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['text/plain', 'text/markdown', 'application/json'];
    const allowedExtensions = ['.txt', '.md', '.json'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload .txt, .md, or .json files.' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const newSkill = createSkillFromUploadedFile(file.name, content);

    return NextResponse.json(newSkill);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to process uploaded file' }, { status: 500 });
  }
}
