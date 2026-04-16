'use client';

import { ReactNode, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationButton } from '@/components/notification-button';
import { WhatsAppButton } from '@/components/whatsapp-button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, ShoppingBag, HelpCircle, Settings, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/earn', label: 'Earn', icon: TrendingUp },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/support', label: 'Support', icon: HelpCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children, title }: AppLayoutProps) {
  const pathname = usePathname();
  const { logout, user } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex flex-col">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Top Navigation Bar */}
      <header className="glass border-b border-white/20 dark:border-slate-700/30 sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
              PrimexStream
            </h1>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 hover:bg-white/10 dark:hover:bg-slate-700/30 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-slate-900 dark:text-white" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
                    relative group
                    ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side - Theme Toggle, Notifications & User Menu */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {user?.id && <NotificationButton userId={user.id} />}

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/30 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-700 dark:text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass rounded-xl border border-white/20 dark:border-slate-700/30 shadow-lg z-50">
                  <div className="px-4 py-3 border-b border-white/10 dark:border-slate-700/20">
                    <p className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold">Account</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-1">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 dark:border-slate-700/20">
            <nav className="flex flex-col gap-2 px-4 py-4">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                      ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-md'
                          : 'text-slate-700 dark:text-slate-400 hover:bg-white/10 dark:hover:bg-slate-700/30'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="w-full">
          {children}
        </div>
      </main>

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Decorative Glows */}
      <div className="fixed -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-200/5 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
