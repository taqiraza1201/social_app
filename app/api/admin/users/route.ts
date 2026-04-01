import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = verifyAdminToken(token);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { data: users } = await supabase
      .from('users')
      .select('id, email, coins, is_verified, is_disabled, created_at')
      .order('created_at', { ascending: false });

    return NextResponse.json({ users: users ?? [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = verifyAdminToken(token);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { userId, is_disabled } = body;

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabase = createServerClient();
    await supabase.from('users').update({ is_disabled }).eq('id', userId);

    return NextResponse.json({ message: 'User updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
