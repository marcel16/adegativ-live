'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Toast } from '@/components/toast';

export default function AdegasPage() {
  const [adegas, setAdegas] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', companyId: '', address: '', city: '', state: '' });

  useEffect(() => {
    api.get('/users/companies').then(({ data }) => {
      setCompanies(data || []);
      if (data?.[0]) setForm(f => ({ ...f, companyId: data[0].id }));
    });
    api.get('/adegas').then(({ data }) => setAdegas(data || [])).catch(() => {});
  }, []);

  const createAdega = async () => {
    try {
      const { data } = await api.post('/adegas', form);
      setAdegas(prev => [...prev, data]);
      setShowModal(false);
      Toast.success('Adega criada!');
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao criar adega');
    }
  };

  const generateStreamCode = async (adegaId: string) => {
    try {
      const { data } = await api.post(`/adegas/${adegaId}/generate-stream-code`);
      setAdegas(prev => prev.map(a => a.id === adegaId ? { ...a, streamCode: data.streamCode } : a));
      Toast.success(`Código de stream gerado: ${data.streamCode}`);
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao gerar código');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Adegas</h1>
          <p className="text-gray-500 text-sm">Gerencie suas lojas e distribuidoras</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition font-medium">
          + Nova Adega
        </button>
      </div>

      {adegas.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">🏪</p>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma adega cadastrada</h3>
          <p className="text-gray-500 mb-4">Cadastre sua primeira adega para começar</p>
          <button onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition">
            Cadastrar Adega
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adegas.map((adega) => (
          <div key={adega.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <h3 className="text-lg font-semibold text-gray-800">{adega.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{adega.city}{adega.city && adega.state ? ', ' : ''}{adega.state}</p>
            <div className="flex gap-4 mt-4 text-sm text-gray-600">
              <span>📺 {adega.tvDevices?.length || 0} TVs</span>
            </div>
            {adega.streamCode ? (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                <p className="text-green-800 font-medium">Stream: {adega.streamCode}</p>
                <p className="text-green-600 text-xs mt-0.5 break-all">https://tv.adega.queroservico.store/{adega.streamCode}/index.m3u8</p>
              </div>
            ) : (
              <button onClick={() => generateStreamCode(adega.id)}
                className="mt-3 text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-medium">
                + Gerar Código de Stream
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Nova Adega</h2>
            <div className="space-y-3">
              <input placeholder="Nome da adega" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
              <input placeholder="Endereço" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
              <div className="flex gap-2">
                <input placeholder="Cidade" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
                <input placeholder="UF" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2}
                  className="w-20 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={createAdega}
                  className="flex-1 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700">Criar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
