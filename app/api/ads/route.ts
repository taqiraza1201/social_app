import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { createAdSchema } from '@/lib/validations';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = verifyUserToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServerClient();

    // Get all active ads that the user hasn't followed yet
    const { data: followedAdIds } = await supabase
      .from('follows')
      .select('ad_id')
      .eq('user_id', payload.userId);

    const followedIds = followedAdIds?.map((f) => f.ad_id) ?? [];

    const { data: ads } = await supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .neq('user_id', payload.userId) // Don't show own ads
      .order('created_at', { ascending: false });

    // Filter out ads the user has already submitted a follow for (requirement: never show again)
    const filteredAds = (ads ?? []).filter((ad) => !followedIds.includes(ad.id));

    return NextResponse.json({ ads: filteredAds });
  } catch (error) {
    console.error('GET /api/ads error:', error);
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
    const result = createAdSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { name, tiktok_url, target_followers } = result.data;
    const cost = target_followers * 2;

    const supabase = createServerClient();

    // Check user has enough coins
    const { data: user } = await supabase
      .from('users')
      .select('coins')
      .eq('id', payload.userId)
      .single();

    if (!user || user.coins < cost) {
      return NextResponse.json(
        { error: `Insufficient coins. You need ${cost} coins but have ${user?.coins ?? 0}.` },
        { status: 400 }
      );
    }

    // Deduct coins
    await supabase
      .from('users')
      .update({ coins: user.coins - cost })
      .eq('id', payload.userId);

    // Create ad
    const { data: ad, error: adError } = await supabase
      .from('ads')
      .insert({
        user_id: payload.userId,
        name,
        tiktok_url,
        target_followers,
        cost,
      })
      .select()
      .single();

    if (adError || !ad) {
      // Refund coins on error
      await supabase.from('users').update({ coins: user.coins }).eq('id', payload.userId);
      return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
    }

    // Record transaction
    await supabase.from('transactions').insert({
      user_id: payload.userId,
      type: 'debit',
      amount: cost,
      reason: `Created ad campaign: ${name}`,
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    console.error('POST /api/ads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
