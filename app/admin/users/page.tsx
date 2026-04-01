import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import type { User } from '@/lib/types/database';

export default async function AdminUsersPage() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from('users')
    .select('id, email, coins, is_verified, is_disabled, created_at')
    .order('created_at', { ascending: false });

  const users = (data ?? []) as User[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1">{users.length} registered users</p>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Coins</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-white">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-yellow-400 font-medium">🪙 {user.coins}</td>
                  <td className="py-3 px-4">
                    {user.is_disabled ? (
                      <StatusBadge status="removed" />
                    ) : user.is_verified ? (
                      <StatusBadge status="active" />
                    ) : (
                      <StatusBadge status="pending" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
