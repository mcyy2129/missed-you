import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST() {
  try {
    await pool.query('ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey');
    await pool.query('ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey');
    await pool.query('ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey');
    return NextResponse.json({ success: true, message: 'Foreign keys dropped for AI compatibility' });
  } catch (error: any) {
    console.error('Schema fix error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
