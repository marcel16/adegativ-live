'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Subscription {
  id: string;
  status: string;
  trialEndsAt: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  company: { id: string; name: string; email: string };
  plan: { id: string; name: string; priceMonthly: number };
  payments: any[];
}

interface Summary {
  total: number;
  active: number;
  trial: number;
  expired: number;
  revenue: number;
}

export default function AssinaturasPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchData = (p: number) => {
    setLoading(true);
    Promise.all([
      api.get(`/payments/admin/subscriptions?page=${p}&limit=20`),
      api.get('/payments/admin/summary'),
    ]).then(([subsRes, summaryRes]) => {
      setSubscriptions(subsRes.data.data || []);
      setTotalPages(subsRes.data.totalPages || 1);
      setSummary(summaryRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(page); }, [page]);

  const statusColors: Record<string, string> = {
    TRIAL: 'bg-amber-100 text-amber-700',
    ACTIVE: 'bg-green-100 text-green-700',
    EXPIRED: 'bg-red-100 text-red-700',
    CANCELED: 'bg-gray-100 text-gray-600',
    BLOCKED: 'bg-red-100 text-red-700',
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading && subscriptions.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Assinaturas</h1>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
            <p className="text-sm text-gray-500">Total</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-green-600">{summary.active}</p>
            <p className="text-sm text-gray-500">Ativas</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-amber-600">{summary.trial}</p>
            <p className="text-sm text-gray-500">Trial</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-red-600">{summary.expired}</p>
            <p className="text-sm text-gray-500">Vencidas</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.revenue)}</p>
            <p className="text-sm text-gray-500">Receita</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Plano</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Início</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Vencimento</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{sub.company?.name || '---'}</p>
                    <p className="text-sm text-gray-500">{sub.company?.email || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{sub.plan?.name || '---'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[sub.status] || 'bg-gray-100 text-gray-600'}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sub.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString('pt-BR') : '---'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR') : '---'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {sub.plan ? formatCurrency(sub.plan.priceMonthly) : '---'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-white border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-white border text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
