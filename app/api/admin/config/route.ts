import { NextRequest, NextResponse } from 'next/server';

interface ModelConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

let config: ModelConfig = {
  apiKey: process.env.NVIDIA_API_KEY || '',
  model: process.env.NVIDIA_MODEL || 'minimaxai/minimax-m3',
  baseUrl: 'https://integrate.api.nvidia.com/v1',
  maxTokens: 1024,
  temperature: 0.7,
  systemPrompt: '你是一个友善、活泼的聊天伙伴。请用自然、亲切的语气与用户对话，适当使用表情符号。',
};

export async function GET() {
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  config = { ...config, ...body };
  return NextResponse.json(config);
}
