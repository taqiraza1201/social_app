import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';
import { adminLoginSchema } from '@/lib/validations';
import { signAdminToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { AdminUser } from '@/lib/types/database';

export async function POST(request: Request) {
  // Strict rate limit for admin: 5 attempts per 15 minutes per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

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

    // Use constant-time comparison indirectly: always run bcrypt.compare to prevent timing attacks
    const dummyHash = '$2b$12$invalidhashfortimingnormalization000000000000000000000';
    const hashToCompare = admin ? admin.password_hash : dummyHash;
    const passwordMatch = await bcrypt.compare(password, hashToCompare);

    if (!admin || !passwordMatch) {
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

