import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAdminToken } from '@/lib/auth';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const adminNav = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/verifications', label: 'Verifications', icon: '✅' },
  { href: '/admin/users', label: 'Users', icon: '👤' },
  { href: '/admin/ads', label: 'Ads', icon: '📢' },
  { href: '/admin/contact', label: 'Messages', icon: '✉️' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) redirect('/admin/login');
  const payload = verifyAdminToken(token);
  if (!payload) redirect('/admin/login');

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Admin Sidebar */}
      <aside className="w-60 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <div>
              <div className="font-bold text-white text-sm">Admin Panel</div>
              <div className="text-xs text-gray-500">{payload.username}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <form action="/api/admin/logout" method="POST">
            <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
              🚪 Sign Out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

