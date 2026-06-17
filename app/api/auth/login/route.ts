import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, updateOnlineStatus } from '@/lib/sqlite';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: '请输入邮箱和密码' }, { status: 400 });
    }

    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
    }

    await updateOnlineStatus(user.id, true);

    return NextResponse.json({
      id: user.id,
      userCode: user.user_code,
      email: user.email,
      name: user.name,
      age: user.age,
      city: user.city,
      avatar: user.avatar,
      bio: user.bio,
      interests: user.interests,
      photos: user.photos,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 });
  }
}
