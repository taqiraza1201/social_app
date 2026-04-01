import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { verificationActionSchema } from '@/lib/validations';
import type { Follow, Ad } from '@/lib/types/database';

type FollowWithAd = Follow & { ads: Ad | null };

function getAdminFromCookies() {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function GET(request: Request) {
  try {
    const admin = getAdminFromCookies();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const supabase = createServerClient();
    const { data: follows } = await supabase
      .from('follows')
      .select('*, ads(name, tiktok_url), users(email)')
      .eq('status', status as 'pending' | 'approved' | 'rejected')
      .order('created_at', { ascending: false });

    return NextResponse.json({ follows: follows ?? [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = getAdminFromCookies();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = verificationActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { follow_id, action, rejection_reason } = result.data;
    const supabase = createServerClient();

    // Get follow with ad info - use explicit cast
    const { data: rawFollow } = await supabase
      .from('follows')
      .select('*, ads(*)')
      .eq('id', follow_id)
      .eq('status', 'pending')
      .single();

    const follow = rawFollow as FollowWithAd | null;

    if (!follow) {
      return NextResponse.json({ error: 'Follow not found or already processed' }, { status: 404 });
    }

    // Update follow status
    await supabase.from('follows').update({
      status: action,
      rejection_reason: action === 'rejected' ? (rejection_reason || null) : null,
      verified_at: new Date().toISOString(),
    }).eq('id', follow_id);

    // If approved, award coins and update ad progress
    if (action === 'approved') {
      const REWARD = 50;

      const { data: userData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', follow.user_id)
        .single();

      if (userData) {
        await supabase
          .from('users')
          .update({ coins: userData.coins + REWARD })
          .eq('id', follow.user_id);
      }

      await supabase.from('transactions').insert({
        user_id: follow.user_id,
        type: 'credit',
        amount: REWARD,
        reason: `Follow approved for ad: ${follow.ads?.name || 'Unknown'}`,
      });

      const { data: adData } = await supabase
        .from('ads')
        .select('current_followers, target_followers')
        .eq('id', follow.ad_id)
        .single();

      if (adData) {
        const newFollowers = adData.current_followers + 1;
        const newStatus: 'active' | 'completed' = newFollowers >= adData.target_followers ? 'completed' : 'active';

        await supabase.from('ads').update({
          current_followers: newFollowers,
          status: newStatus,
        }).eq('id', follow.ad_id);
      }
    }

    return NextResponse.json({ message: `Follow ${action} successfully` });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
