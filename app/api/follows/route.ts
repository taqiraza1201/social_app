import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { submitFollowSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();
    const { data: follows } = await supabase
      .from('follows')
      .select('*, ads(name, tiktok_url)')
      .eq('user_id', payload.userId)
      .order('created_at', { ascending: false });

    return NextResponse.json({ follows: follows ?? [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = submitFollowSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { ad_id, screenshot_url } = result.data;
    const supabase = createServerClient();

    // Check ad exists and is active
    const { data: ad } = await supabase
      .from('ads')
      .select('*')
      .eq('id', ad_id)
      .eq('status', 'active')
      .single();

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found or no longer active' }, { status: 404 });
    }

    if (ad.user_id === payload.userId) {
      return NextResponse.json({ error: "You can't follow your own ad" }, { status: 400 });
    }

    // Check not already followed
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('ad_id', ad_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted a follow for this ad' }, { status: 409 });
    }

    // Create follow
    const { data: follow, error: followError } = await supabase
      .from('follows')
      .insert({
        user_id: payload.userId,
        ad_id,
        screenshot_url,
        status: 'pending',
      })
      .select()
      .single();

    if (followError || !follow) {
      return NextResponse.json({ error: 'Failed to submit follow' }, { status: 500 });
    }

    return NextResponse.json({ follow }, { status: 201 });
  } catch (error) {
    console.error('POST /api/follows error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
