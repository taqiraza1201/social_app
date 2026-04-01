import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';
import { adminLoginSchema } from '@/lib/validations';
import { signAdminToken } from '@/lib/auth';
import type { AdminUser } from '@/lib/types/database';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = adminLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { username, password } = result.data;
    const supabase = createServerClient();

    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, created_at')
      .eq('username', username)
      .single();

    const admin = adminData as AdminUser | null;

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signAdminToken({ adminId: admin.id, username: admin.username });

    const response = NextResponse.json({ message: 'Admin login successful' });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
