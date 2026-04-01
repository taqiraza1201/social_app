import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserToken } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('user_token')?.value;

  if (!token) redirect('/auth/login');

  const payload = verifyUserToken(token);
  if (!payload) redirect('/auth/login');

  const supabase = createServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('coins, email')
    .eq('id', payload.userId)
    .single();

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar userEmail={user?.email} coins={user?.coins ?? 0} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
