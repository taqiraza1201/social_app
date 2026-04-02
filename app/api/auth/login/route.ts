import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations';
import { signUserToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate-limit by IP: 10 attempts per 15 minutes
  const ip = getClientIp(request);
  const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
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

    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = result.data;
    const supabase = createServerClient();

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.is_disabled) {
      return NextResponse.json({ error: 'Your account has been disabled. Please contact support.' }, { status: 403 });
    }

    if (!user.is_verified) {
      return NextResponse.json({ error: 'Please verify your email before logging in.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = signUserToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({ message: 'Login successful' });
    response.cookies.set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

