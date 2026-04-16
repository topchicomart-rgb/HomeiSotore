'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Zap, TrendingUp, PackageOpen, HelpCircle } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/iptv', label: 'IPTV', icon: Zap },
  { href: '/earn', label: 'Earn', icon: TrendingUp },
  { href: '/orders', label: 'Orders', icon: PackageOpen },
  { href: '/support', label: 'Support', icon: HelpCircle },
];

export function BottomNavigation() {
  const pathname = usePathname();

  // Hide bottom nav on public pages and auth pages
  if (pathname === '/' || pathname === '/login' || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      {/* Spacer for bottom nav */}
      <div className="h-24" />

      {/* Actual Navigation */}
      <nav className="glass border-t border-white/20 dark:border-slate-700/30 backdrop-blur-xl">
        <div className="flex justify-around items-center h-20 max-w-7xl mx-auto px-2 w-full">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href));

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/20 dark:bg-emerald-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
