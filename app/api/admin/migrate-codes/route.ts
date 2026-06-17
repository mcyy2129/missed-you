import { NextResponse } from 'next/server';
import { migrateUserCodes } from '@/lib/sqlite';

export async function POST() {
  try {
    const migratedCount = await migrateUserCodes();
    return NextResponse.json({
      success: true,
      message: `已为 ${migratedCount} 个用户添加邀请码`
    });
  } catch (error) {
    console.error('Migrate user codes error:', error);
    return NextResponse.json({ error: '迁移失败' }, { status: 500 });
  }
}
