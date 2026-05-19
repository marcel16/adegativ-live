'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: '📊' },
  { href: '/dashboard/adegas', label: 'Adegas', icon: '🏪' },
  { href: '/dashboard/tvs', label: 'TVs', icon: '📺' },
  { href: '/dashboard/media', label: 'Mídia', icon: '🎬' },
  { href: '/dashboard/schedule', label: 'Agenda', icon: '📅' },
  { href: '/dashboard/playlists', label: 'Playlists', icon: '📋' },
  { href: '/dashboard/planos', label: 'Planos', icon: '💳' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, loadUser, user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { loadUser(); }, [loadUser]);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-adega-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}>
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-adega-700">AdegaTV Live</h1>
          <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${pathname === item.href ? 'bg-adega-50 text-adega-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button onClick={() => logout().then(() => router.push('/login'))}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full mt-8">
            <span>🚪</span> Sair
          </button>
        </nav>
      </aside>
      <div className="flex-1 lg:pl-64">
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between lg:justify-end">
          <button className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="text-2xl">☰</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <div className="w-8 h-8 bg-adega-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
