import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';

export default async function AdminOverviewPage() {
  const supabase = createServerClient();

  const [
    { count: userCount },
    { count: adCount },
    { count: pendingCount },
    { count: approvedCount },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('ads').select('*', { count: 'exact', head: true }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
  ]);

  const stats = [
    { label: 'Total Users', value: userCount ?? 0, icon: '👤', color: 'from-blue-500/20' },
    { label: 'Active Ads', value: adCount ?? 0, icon: '📢', color: 'from-tiktok-pink/20' },
    { label: 'Pending Reviews', value: pendingCount ?? 0, icon: '⏳', color: 'from-yellow-500/20' },
    { label: 'Approved Follows', value: approvedCount ?? 0, icon: '✅', color: 'from-green-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400 mt-1">Platform management dashboard</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} to-transparent border-gray-800`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
