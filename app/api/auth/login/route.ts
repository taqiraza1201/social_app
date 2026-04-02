import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/validations';
import { signUserToken } from '@/lib/auth';
import { getErrorMessage } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    let supabase;
    try {
      supabase = createServerClient();
    } catch (initError) {
      console.error('Login config error:', getErrorMessage(initError));
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (dbError) {
      console.error('Login DB error:', dbError);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.is_disabled) {
      return NextResponse.json({ error: 'Your account has been disabled' }, { status: 403 });
    }

    if (!user.is_verified) {
      return NextResponse.json({ error: 'Please verify your email first' }, { status: 403 });
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
