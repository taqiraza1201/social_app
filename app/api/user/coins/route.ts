import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { data: user } = await supabase
      .from('users')
      .select('coins')
      .eq('id', payload.userId)
      .single();

    return NextResponse.json({ coins: user?.coins ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
