import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { verifyOTPSchema } from '@/lib/validations';
import { signUserToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = verifyOTPSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { email, otp } = result.data;
    const supabase = createServerClient();

    // Find valid OTP
    const { data: otpRecord } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Mark OTP as used
    await supabase.from('otp_codes').update({ used: true }).eq('id', otpRecord.id);

    // Verify user
    const { data: user } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('email', email)
      .select()
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate JWT and set cookie
    const token = signUserToken({ userId: user.id, email: user.email });

    const response = NextResponse.json({ message: 'Email verified successfully' });
    response.cookies.set('user_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
