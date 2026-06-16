import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/sqlite';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const user = getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
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
    console.error('Get profile error:', error);
    return NextResponse.json({ error: '获取资料失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, name, age, city, bio, interests, photos, avatar } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    updateUser(userId, {
      name,
      age,
      city,
      bio,
      interests,
      photos,
      avatar,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: '更新资料失败' }, { status: 500 });
  }
}
