import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
