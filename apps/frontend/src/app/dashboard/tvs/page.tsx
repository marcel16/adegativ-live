'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Toast } from '@/components/toast';

export default function TVsPage() {
  const [adegas, setAdegas] = useState<any[]>([]);
  const [selectedAdega, setSelectedAdega] = useState('');
  const [tvs, setTvs] = useState<any[]>([]);
  const [showPairing, setShowPairing] = useState(false);
  const [pairingCode, setPairingCode] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [urlCopyFeedback, setUrlCopyFeedback] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('WEB');

  const PLATFORMS = [
    { value: 'WEB', label: 'Web Player (Navegador)' },
    { value: 'ROKU', label: 'Roku TV' },
    { value: 'SAMSUNG', label: 'Samsung Tizen' },
    { value: 'LG', label: 'LG webOS' },
    { value: 'ANDROID_TV', label: 'Android TV' },
  ];

  useEffect(() => {
    api.get('/adegas').then(({ data }) => setAdegas(data || [])).catch(() => {});
  }, []);

  const loadTVs = (adegaId: string) => {
    setSelectedAdega(adegaId);
    api.get(`/tv/adega/${adegaId}`).then(({ data }) => setTvs(data || [])).catch(() => setTvs([]));
  };

  const generateCode = async () => {
    try {
      const platformLabel = PLATFORMS.find(p => p.value === selectedPlatform)?.label || selectedPlatform;
      const { data } = await api.post('/tv/pairing/generate', { platform: selectedPlatform, model: platformLabel });
      setPairingCode(data.code);
      setCopyFeedback('');
      Toast.success('Código gerado!');
    } catch {
      Toast.error('Erro ao gerar código');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopyFeedback('Copiado!');
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  const revokeTV = async (tvId: string) => {
    try {
      await api.delete(`/tv/${tvId}/revoke`);
      if (selectedAdega) loadTVs(selectedAdega);
      Toast.success('TV desvinculada');
    } catch {
      Toast.error('Erro ao desvincular TV');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">TVs</h1>
          <p className="text-gray-500 text-sm">Gerencie os dispositivos das suas adegas</p>
        </div>
        <button onClick={() => setShowPairing(!showPairing)}
          className="px-4 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition font-medium">
          {showPairing ? 'Fechar' : '+ Parear TV'}
        </button>
      </div>

      {showPairing && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Parear nova TV</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Selecione a adega</label>
              <select value={selectedAdega} onChange={e => setSelectedAdega(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500">
                <option value="">Selecione...</option>
                {adegas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Plataforma</label>
              <select value={selectedPlatform} onChange={e => setSelectedPlatform(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500">
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <button onClick={generateCode} disabled={!selectedAdega}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              Gerar Código
            </button>
          </div>
          {pairingCode && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-sm text-gray-500 mb-2">Código de pareamento (válido por 10 minutos)</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-4xl font-mono font-bold text-adega-700 tracking-[0.5em]">{pairingCode}</span>
                <button onClick={copyCode}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm transition">
                  {copyFeedback || 'Copiar'}
                </button>
              </div>
              {selectedPlatform === 'WEB' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Ou acesse o Web Player diretamente pelo navegador:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-sm bg-white px-3 py-2 rounded border text-gray-700 select-all">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/player/pair
                    </code>
                    <button onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/player/pair`);
                      setUrlCopyFeedback('Copiada!');
                      setTimeout(() => setUrlCopyFeedback(''), 2000);
                    }}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition whitespace-nowrap">
                      {urlCopyFeedback || 'Copiar URL'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Abra esta URL no navegador da TV. O código será gerado automaticamente.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {adegas.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">📺</p>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma adega cadastrada</h3>
          <p className="text-gray-500">Cadastre uma adega primeiro para gerenciar TVs</p>
        </div>
      )}

      {selectedAdega && tvs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 As TVs exibem automaticamente o conteúdo das <strong>agendas ativas</strong> da adega.
            Para alterar o que aparece, acesse <a href="/dashboard/schedule" className="text-blue-600 underline">Agenda de Programação</a>.
          </p>
        </div>
      )}

      {adegas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adegas.map(adega => (
            <div key={adega.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition cursor-pointer"
              onClick={() => loadTVs(adega.id)}>
              <h3 className="text-lg font-semibold text-gray-800">{adega.name}</h3>
              <div className="mt-4 space-y-2">
                {adega.tvDevices?.length > 0 ? adega.tvDevices.map((tv: any) => (
                  <div key={tv.id} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tv.name || 'TV'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${tv.status === 'ONLINE' ? 'bg-green-100 text-green-700' : tv.status === 'PAIRING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                          {tv.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{PLATFORMS.find(p => p.value === tv.platform)?.label || tv.platform}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {tv.platform === 'WEB' ? (
                        <a href={`/player/${tv.deviceToken}`} target="_blank" rel="noopener noreferrer"
                          className="text-adega-600 hover:text-adega-800 underline flex items-center gap-1"
                          onClick={e => e.stopPropagation()}>
                          ▶ Abrir Web Player
                        </a>
                      ) : tv.lastIp && <span>🌐 {tv.lastIp}</span>}
                      {tv.lastAccessAt && (
                        <span>🕐 {new Date(tv.lastAccessAt).toLocaleString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-gray-400 text-center py-2">Nenhuma TV vinculada</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
