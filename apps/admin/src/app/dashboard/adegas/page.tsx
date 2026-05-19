'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AdminAdegasPage() {
  const [adegas, setAdegas] = useState<any[]>([]);

  useEffect(() => {
    api.get('/adegas').then(({ data }) => setAdegas(data || [])).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Adegas</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Nome</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Cidade</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">TVs</th>
              <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adegas.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{a.name}</td>
                <td className="p-4 text-sm text-gray-500">{a.city || '-'}</td>
                <td className="p-4 text-sm text-gray-500">{a.tvDevices?.length || 0}</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{a.isActive ? 'Ativo' : 'Inativo'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
