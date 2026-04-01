import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default async function MyAdsPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('user_token')?.value;
  if (!token) redirect('/auth/login');
  const payload = verifyUserToken(token);
  if (!payload) redirect('/auth/login');

  const supabase = createServerClient();
  const { data: ads } = await supabase
    .from('ads')
    .select('*')
    .eq('user_id', payload.userId)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Ads</h1>
          <p className="text-gray-400 mt-1">Manage your TikTok follower campaigns</p>
        </div>
        <Link
          href="/dashboard/ads/create"
          className="px-5 py-2.5 bg-tiktok-pink hover:bg-tiktok-pink/80 text-white font-semibold rounded-xl transition-all text-sm"
        >
          + Create Ad
        </Link>
      </div>

      {ads && ads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ads.map((ad) => {
            const progress = Math.min((ad.current_followers / ad.target_followers) * 100, 100);
            return (
              <Card key={ad.id} hover>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{ad.name}</h3>
                    <a
                      href={ad.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tiktok-cyan text-xs hover:underline"
                    >
                      {ad.tiktok_url}
                    </a>
                  </div>
                  <StatusBadge status={ad.status} />
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{ad.current_followers} / {ad.target_followers} followers</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-tiktok-pink to-brand-500 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span>Cost: {ad.cost} coins</span>
                  <span>{formatDate(ad.created_at)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-16">
          <div className="text-5xl mb-4">📢</div>
          <h2 className="text-xl font-semibold text-white mb-2">No ads yet</h2>
          <p className="text-gray-400 mb-6">Create your first ad campaign to start getting followers</p>
          <Link
            href="/dashboard/ads/create"
            className="inline-flex items-center px-6 py-3 bg-tiktok-pink hover:bg-tiktok-pink/80 text-white font-semibold rounded-xl transition-all"
          >
            Create Your First Ad
          </Link>
        </Card>
      )}
    </div>
  );
}
