import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, deleteUserCascade, updateUser, updateUserPassword, getUserById } from '@/lib/sqlite';

let usersCache: any = null;
let usersCacheTime = 0;
const CACHE_TTL = 30000;

export async function GET(req: NextRequest) {
  try {
    const now = Date.now();
    if (usersCache && now - usersCacheTime < CACHE_TTL) {
      return NextResponse.json(usersCache);
    }
    const users = await getAllUsers();
    usersCache = users;
    usersCacheTime = now;
    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: '获取用户列表失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    await deleteUserCascade(userId);
    usersCache = null;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId, newPassword, ...updateData } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    if (newPassword) {
      await updateUserPassword(userId, newPassword);
    }

    if (Object.keys(updateData).length > 0) {
      await updateUser(userId, updateData);
    }

    usersCache = null;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 });
  }
}
