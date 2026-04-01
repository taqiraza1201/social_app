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
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', payload.userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({ transactions: transactions ?? [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
