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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = createServerClient();
    let query = supabase
      .from('ads')
      .select('*, users(email)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status as 'active' | 'completed' | 'removed');
    }

    const { data: ads } = await query;
    return NextResponse.json({ ads: ads ?? [] });
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
    const { adId, status } = body;

    const validStatuses = ['active', 'completed', 'removed'] as const;
    type AdStatus = typeof validStatuses[number];

    if (!adId || !status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'adId and valid status required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const typedStatus = status as AdStatus;
    await supabase.from('ads').update({ status: typedStatus }).eq('id', adId);

    return NextResponse.json({ message: 'Ad updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
