'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({ adegas: 0, plans: 0, clients: 0, subscriptions: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/adegas').catch(() => ({ data: [] })),
      api.get('/plans').catch(() => ({ data: [] })),
      api.get('/users').catch(() => ({ data: [] })),
      api.get('/payments/admin/summary').catch(() => ({ data: null })),
    ]).then(([adegas, plans, users, summary]) => {
      const s = summary.data || {};
      setStats({
        adegas: (adegas.data || []).length,
        plans: (plans.data || []).filter((p: any) => p.status === 'ACTIVE').length,
        clients: s.total || 0,
        subscriptions: s.active || 0,
        revenue: s.revenue || 0,
      });
    });
  }, []);

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const cards = [
    { label: 'Adegas', value: stats.adegas, color: 'bg-blue-500' },
    { label: 'Planos', value: stats.plans, color: 'bg-purple-500' },
    { label: 'Assinaturas', value: stats.subscriptions || '-', color: 'bg-amber-500' },
    { label: 'Receita', value: stats.revenue > 0 ? formatCurrency(stats.revenue) : '-', color: 'bg-green-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Administrativo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-white font-bold">{card.label.charAt(0)}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
