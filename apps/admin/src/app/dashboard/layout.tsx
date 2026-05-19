'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/clientes', label: 'Clientes', icon: '👥' },
  { href: '/dashboard/adegas', label: 'Adegas', icon: '🏪' },
  { href: '/dashboard/planos', label: 'Planos', icon: '📋' },
  { href: '/dashboard/assinaturas', label: 'Assinaturas', icon: '💳' },
  { href: '/dashboard/pagamentos', label: 'Pagamentos', icon: '💰' },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.push('/login');
  }, [router]);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefresh');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen">
      <Toaster position="top-right" />
      <aside className="w-64 bg-gray-900 text-white min-h-screen">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">AdegaTV Live</h1>
          <p className="text-sm text-gray-400 mt-1">Admin</p>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${pathname === item.href ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full mt-8">
            <span>🚪</span> Sair
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
