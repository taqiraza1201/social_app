import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';
import { signupSchema } from '@/lib/validations';
import { generateOTP, getOTPExpiry } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle resend case
    if (body.resend && body.email) {
      const supabase = createServerClient();
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      await supabase.from('otp_codes').insert({
        email: body.email,
        code: otp,
        expires_at: expiresAt.toISOString(),
      });

      await sendOTPEmail(body.email, otp);
      return NextResponse.json({ message: 'OTP resent' });
    }

    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const supabase = createServerClient();

    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({ email, password_hash: passwordHash, coins: 100 })
      .select()
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Record initial coins transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'credit',
      amount: 100,
      reason: 'Welcome bonus',
    });

    // Generate and send OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    await supabase.from('otp_codes').insert({
      email,
      code: otp,
      expires_at: expiresAt.toISOString(),
    });

    await sendOTPEmail(email, otp);

    return NextResponse.json({ message: 'Account created. Please verify your email.' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
