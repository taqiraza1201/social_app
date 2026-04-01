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

      const { error: otpError } = await supabase.from('otp_codes').insert({
        email: body.email,
        code: otp,
        expires_at: expiresAt.toISOString(),
      });

      if (otpError) {
        console.error('OTP insert error:', otpError);
        return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
      }

      try {
        await sendOTPEmail(body.email, otp);
      } catch (emailError) {
        console.error('Email send error (resend):', emailError);
      }

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

    let supabase;
    try {
      supabase = createServerClient();
    } catch (initError) {
      console.error('Supabase init error:', initError instanceof Error ? initError.message : initError);
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Check if user exists — use maybeSingle() to avoid PGRST116 when no rows found
    const { data: existing, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('User existence check error — code:', checkError.code, '| message:', checkError.message, '| hint:', checkError.hint, '| details:', checkError.details);
      return NextResponse.json({ error: 'Database error checking account' }, { status: 500 });
    }

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
      console.error('User creation error — code:', userError?.code, '| message:', userError?.message, '| hint:', userError?.hint);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    // Record initial coins transaction (non-fatal)
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'credit',
      amount: 100,
      reason: 'Welcome bonus',
    });

    if (txError) {
      console.error('Welcome transaction error:', txError);
    }

    // Generate and store OTP (non-fatal)
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    const { error: otpError } = await supabase.from('otp_codes').insert({
      email,
      code: otp,
      expires_at: expiresAt.toISOString(),
    });

    if (otpError) {
      console.error('OTP insert error:', otpError);
    }

    // Send verification email (non-fatal — account is already created)
    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }

    return NextResponse.json({ message: 'Account created. Please verify your email.' }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
