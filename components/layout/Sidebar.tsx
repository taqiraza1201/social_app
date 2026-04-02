'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/ads', label: 'My Ads', icon: '📢' },
  { href: '/dashboard/ads/create', label: 'Create Ad', icon: '➕' },
  { href: '/dashboard/follow', label: 'Browse & Follow', icon: '👥' },
  { href: '/dashboard/transactions', label: 'Transactions', icon: '💰' },
  { href: '/dashboard/contact', label: 'Contact Support', icon: '✉️' },
];

interface SidebarProps {
  userEmail?: string;
  coins?: number;
}

export function Sidebar({ userEmail, coins }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  }

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🎵</span>
          <span className="gradient-text">TikTok Coins</span>
        </Link>
      </div>

      {/* Coin balance */}
      <div className="p-4 mx-4 mt-4 rounded-xl bg-gradient-to-r from-tiktok-pink/20 to-brand-600/20 border border-tiktok-pink/20">
        <div className="text-xs text-gray-400 mb-1">Coin Balance</div>
        <div className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🪙</span>
          <span>{coins ?? 0}</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-tiktok-pink/15 text-tiktok-pink border border-tiktok-pink/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500 truncate mb-3">{userEmail}</div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}
