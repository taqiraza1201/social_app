import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createServerClient } from '@/lib/supabase/server';
import { signupSchema } from '@/lib/validations';
import { generateOTP, getOTPExpiry } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';

type ErrorType =
  | 'CONFIG_ERROR'
  | 'DB_CONNECT_ERROR'
  | 'DB_QUERY_ERROR'
  | 'EMAIL_EXISTS'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR';

function errorResponse(message: string, errorType: ErrorType, status: number, requestId: string) {
  return NextResponse.json({ error: message, errorType, requestId }, { status });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    // ✅ prevent hard crash on invalid/empty JSON body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid request body', 'VALIDATION_ERROR', 400, requestId);
    }

    // ── Resend OTP path ──────────────────────────────────────────────────────
    if ((body as any).resend && (body as any).email) {
      let supabase;
      try {
        supabase = createServerClient();
      } catch (initError) {
        console.error(JSON.stringify({
          requestId, stage: 'init', event: 'CONFIG_ERROR',
          message: initError instanceof Error ? initError.message : String(initError),
        }));
        return errorResponse('Server configuration error', 'CONFIG_ERROR', 500, requestId);
      }

      const email = String((body as any).email).toLowerCase().trim();
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      const { error: otpError } = await supabase.schema('public').from('otp_codes').insert({
        email,
        code: otp,
        expires_at: expiresAt.toISOString(),
      });

      if (otpError) {
        console.error(JSON.stringify({
          requestId, stage: 'resend_otp', event: 'DB_QUERY_ERROR',
          code: otpError.code, message: otpError.message, details: otpError.details, hint: otpError.hint,
        }));
        return errorResponse('Failed to generate OTP', 'DB_QUERY_ERROR', 500, requestId);
      }

      try {
        await sendOTPEmail(email, otp);
      } catch (emailError) {
        console.error(JSON.stringify({
          requestId, stage: 'resend_otp', event: 'email_send_failed',
          message: emailError instanceof Error ? emailError.message : String(emailError),
        }));
      }

      return NextResponse.json({ message: 'OTP resent', requestId });
    }

    // ── Validate input ───────────────────────────────────────────────────────
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return errorResponse(result.error.errors[0]?.message ?? 'Invalid input', 'VALIDATION_ERROR', 400, requestId);
    }

    const email = result.data.email.toLowerCase().trim();
    const { password } = result.data;

    let supabase;
    try {
      supabase = createServerClient();
    } catch (initError) {
      console.error(JSON.stringify({
        requestId, stage: 'init', event: 'CONFIG_ERROR',
        message: initError instanceof Error ? initError.message : String(initError),
      }));
      return errorResponse('Server configuration error', 'CONFIG_ERROR', 500, requestId);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: user, error: userError } = await supabase
      .schema('public')
      .from('users')
      .insert({ email, password_hash: passwordHash, coins: 100 })
      .select('id,email')
      .single();

    if (userError || !user) {
      const msg = userError?.message ?? '';
      const details = userError?.details ?? '';
      const isDuplicate =
        userError?.code === '23505' ||
        (/duplicate|unique/i.test(msg) && /email/i.test(msg)) ||
        (/duplicate|unique/i.test(details) && /email/i.test(details));

      if (isDuplicate) {
        return errorResponse('An account with this email already exists', 'EMAIL_EXISTS', 409, requestId);
      }

      console.error(JSON.stringify({
        requestId, stage: 'insert_user', event: 'DB_QUERY_ERROR',
        code: userError?.code, message: userError?.message, details: userError?.details, hint: userError?.hint,
      }));
      return errorResponse('Failed to create account', 'DB_QUERY_ERROR', 500, requestId);
    }

    const { error: txError } = await supabase.schema('public').from('transactions').insert({
      user_id: user.id,
      type: 'credit',
      amount: 100,
      reason: 'Welcome bonus',
    });

    if (txError) {
      console.error(JSON.stringify({
        requestId, stage: 'welcome_transaction', event: 'DB_QUERY_ERROR',
        code: txError.code, message: txError.message,
      }));
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    const { error: otpError } = await supabase.schema('public').from('otp_codes').insert({
      email,
      code: otp,
      expires_at: expiresAt.toISOString(),
    });

    if (otpError) {
      console.error(JSON.stringify({
        requestId, stage: 'insert_otp', event: 'DB_QUERY_ERROR',
        code: otpError.code, message: otpError.message,
      }));
    }

    try {
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error(JSON.stringify({
        requestId, stage: 'send_otp_email', event: 'email_send_failed',
        message: emailError instanceof Error ? emailError.message : String(emailError),
      }));
    }

    return NextResponse.json(
      { message: 'Account created. Please verify your email.', requestId },
      { status: 201 },
    );
  } catch (error) {
    console.error(JSON.stringify({
      requestId, stage: 'unhandled', event: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : String(error),
    }));
    return errorResponse('Internal server error', 'INTERNAL_ERROR', 500, requestId);
  }
           }
