'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Payment {
  id: string;
  gateway: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  invoiceUrl: string;
  dueDate: string;
  paidAt: string;
  createdAt: string;
  subscription: {
    company: { name: string };
    plan: { name: string };
  };
}

export default function PagamentosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/payments/admin/list?page=${page}&limit=20`)
      .then(({ data }) => {
        setPayments(data.data || []);
        setTotalPages(data.totalPages || 1);
      }).catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-700',
    CONFIRMED: 'bg-green-100 text-green-700',
    REFUNDED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-red-100 text-red-700',
    EXPIRED: 'bg-gray-100 text-gray-600',
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading && payments.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pagamentos</h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Plano</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Valor</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Gateway</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Forma</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Data</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-gray-600">Fatura</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{p.subscription?.company?.name || '---'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.subscription?.plan?.name || '---'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.gateway}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.paymentMethod || '---'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString('pt-BR')
                      : p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString('pt-BR')
                        : '---'}
                  </td>
                  <td className="px-4 py-3">
                    {p.invoiceUrl ? (
                      <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer"
                        className="text-primary-600 hover:underline text-sm font-medium">
                        Ver fatura
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">---</span>
                    )}
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
