import { NextRequest, NextResponse } from 'next/server';
import { getUserByUserCode } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const userCode = req.nextUrl.searchParams.get('code');

    if (!userCode) {
      return NextResponse.json({ error: '缺少邀请码' }, { status: 400 });
    }

    const user = await getUserByUserCode(userCode.toUpperCase());

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      userCode: user.user_code,
      name: user.name,
      age: user.age,
      city: user.city,
      avatar: user.avatar,
      bio: user.bio,
      interests: user.interests,
      photos: user.photos,
    });
  } catch (error) {
    console.error('Search user error:', error);
    return NextResponse.json({ error: '搜索用户失败' }, { status: 500 });
  }
}
