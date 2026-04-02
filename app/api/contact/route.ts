import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { contactMessageSchema } from '@/lib/validations';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // Rate-limit: 3 contact messages per hour per IP
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const result = contactMessageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { subject, message } = result.data;
    const supabase = createServerClient();

    // Fetch the user's current email from DB (avoids stale email from JWT payload)
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', payload.userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { error: insertError } = await supabase.from('contact_messages').insert({
      user_id: payload.userId,
      email: userData.email,
      subject,
      message,
    });

    if (insertError) {
      console.error('Contact insert error:', insertError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Message sent successfully' }, { status: 201 });
  } catch (error) {
    console.error('Contact route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  // Admin-only: list all contact messages
  try {
    const cookieStore = cookies();
    const adminToken = cookieStore.get('admin_token')?.value;
    if (!adminToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { verifyAdminToken } = await import('@/lib/auth');
    const admin = verifyAdminToken(adminToken);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { data: messages } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ messages: messages ?? [] });
  } catch (error) {
    console.error('Contact GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
