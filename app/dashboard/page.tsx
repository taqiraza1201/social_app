import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { CoinBalance } from '@/components/dashboard/CoinBalance';
import { TransactionItem } from '@/components/dashboard/TransactionItem';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('user_token')?.value;
  if (!token) redirect('/auth/login');
  const payload = verifyUserToken(token);
  if (!payload) redirect('/auth/login');

  const supabase = createServerClient();

  const [{ data: user }, { data: rawAds }, { data: rawFollows }, { data: transactions }] =
    await Promise.all([
      supabase.from('users').select('*').eq('id', payload.userId).single(),
      supabase.from('ads').select('*').eq('user_id', payload.userId).order('created_at', { ascending: false }).limit(3),
      supabase.from('follows').select('id, status, created_at, ad_id').eq('user_id', payload.userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('transactions').select('*').eq('user_id', payload.userId).order('created_at', { ascending: false }).limit(5),
    ]);

  const myAds = (rawAds ?? []) as import('@/lib/types/database').Ad[];
  const myFollows = (rawFollows ?? []) as { id: string; status: string; created_at: string; ad_id: string }[];

  const stats = [
    { label: 'Total Ads', value: myAds?.length ?? 0, icon: '📢', color: 'from-tiktok-pink/20' },
    { label: 'Follows Submitted', value: myFollows?.length ?? 0, icon: '👥', color: 'from-tiktok-cyan/20' },
    { label: 'Pending Verification', value: myFollows?.filter((f) => f.status === 'pending').length ?? 0, icon: '⏳', color: 'from-yellow-500/20' },
    { label: 'Approved Follows', value: myFollows?.filter((f) => f.status === 'approved').length ?? 0, icon: '✅', color: 'from-green-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {user?.email?.split('@')[0]}</p>
      </div>

      {/* Coin balance */}
      <div className="max-w-xs">
        <CoinBalance coins={user?.coins ?? 0} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} to-transparent border-gray-800`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-tiktok-pink text-sm hover:underline">
              View all
            </Link>
          </div>
          {transactions && transactions.length > 0 ? (
            transactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
          ) : (
            <p className="text-gray-500 text-sm py-4 text-center">No transactions yet</p>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/ads/create"
              className="flex items-center gap-3 p-4 rounded-xl bg-tiktok-pink/10 border border-tiktok-pink/20 hover:bg-tiktok-pink/20 transition-all"
            >
              <span className="text-2xl">📢</span>
              <div>
                <div className="font-medium text-white">Create Ad Campaign</div>
                <div className="text-xs text-gray-400">Spend coins to get followers</div>
              </div>
            </Link>
            <Link
              href="/dashboard/follow"
              className="flex items-center gap-3 p-4 rounded-xl bg-tiktok-cyan/10 border border-tiktok-cyan/20 hover:bg-tiktok-cyan/20 transition-all"
            >
              <span className="text-2xl">👥</span>
              <div>
                <div className="font-medium text-white">Browse & Follow Creators</div>
                <div className="text-xs text-gray-400">Earn 50 coins per follow</div>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
