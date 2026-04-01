import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { Ad } from '@/lib/types/database';

type AdWithUser = Ad & { users: { email: string } | null };

export default async function AdminAdsPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('ads')
    .select('*, users(email)')
    .order('created_at', { ascending: false });

  const ads = (data ?? []) as AdWithUser[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Ad Management</h1>
        <p className="text-gray-400 mt-1">{ads.length} total ads</p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Ad Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-white">{ad.name}</div>
                    <a
                      href={ad.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-tiktok-cyan hover:underline"
                    >
                      {ad.tiktok_url}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">{ad.users?.email || 'Unknown'}</td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {ad.current_followers}/{ad.target_followers}
                  </td>
                  <td className="py-3 px-4 text-sm text-yellow-400">🪙 {ad.cost}</td>
                  <td className="py-3 px-4"><StatusBadge status={ad.status} /></td>
                  <td className="py-3 px-4 text-sm text-gray-400">{formatDate(ad.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
