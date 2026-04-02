import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { verificationActionSchema } from '@/lib/validations';
import type { Ad } from '@/lib/types/database';

type FollowWithAd = {
  id: string;
  user_id: string;
  ad_id: string;
  screenshot_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  verified_at: string | null;
  created_at: string;
  ads: Ad | null;
};

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
    console.error('Admin GET verifications error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = getAdminFromCookies();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const result = verificationActionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { follow_id, action, rejection_reason } = result.data;
    const supabase = createServerClient();

    // ── Atomic idempotency check ────────────────────────────────────────────
    // Update ONLY if current status is still 'pending'.
    // This prevents double-processing if two admins click simultaneously.
    const { data: updatedRows, error: updateError } = await supabase
      .from('follows')
      .update({
        status: action,
        rejection_reason: action === 'rejected' ? (rejection_reason ?? null) : null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', follow_id)
      .eq('status', 'pending') // guard: only process pending submissions
      .select('*, ads(*)')
      .returns<FollowWithAd[]>();

    if (updateError) {
      console.error('Admin verification update error:', updateError);
      return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
    }

    if (!updatedRows || updatedRows.length === 0) {
      // Either the follow doesn't exist or it was already processed
      return NextResponse.json(
        { error: 'Submission not found or already processed' },
        { status: 409 },
      );
    }

    const follow = updatedRows[0];

    // ── Award coins on approval ─────────────────────────────────────────────
    if (action === 'approved') {
      const REWARD = 50;

      // Get current coin balance
      const { data: userData } = await supabase
        .from('users')
        .select('coins')
        .eq('id', follow.user_id)
        .single();

      if (userData) {
        // Update coin balance
        await supabase
          .from('users')
          .update({ coins: userData.coins + REWARD })
          .eq('id', follow.user_id);
      }

      // Record coin transaction
      await supabase.from('transactions').insert({
        user_id: follow.user_id,
        type: 'credit',
        amount: REWARD,
        reason: `Follow approved for: ${follow.ads?.name ?? 'Unknown campaign'}`,
      });

      // Update campaign follower count + auto-complete if target reached
      const { data: adData } = await supabase
        .from('ads')
        .select('current_followers, target_followers')
        .eq('id', follow.ad_id)
        .single();

      if (adData) {
        const newFollowers = adData.current_followers + 1;
        const newStatus: 'active' | 'completed' =
          newFollowers >= adData.target_followers ? 'completed' : 'active';

        await supabase
          .from('ads')
          .update({ current_followers: newFollowers, status: newStatus })
          .eq('id', follow.ad_id);
      }
    }

    return NextResponse.json({ message: `Follow ${action} successfully` });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

