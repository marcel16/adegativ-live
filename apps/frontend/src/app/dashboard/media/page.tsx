'use client';

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { Toast } from '@/components/toast';

export default function MediaPage() {
  const [adegas, setAdegas] = useState<any[]>([]);
  const [selectedAdega, setSelectedAdega] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [showAddToSchedule, setShowAddToSchedule] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ scheduleId: '', priority: 'NORMAL', duration: 10 });
  const [showYoutubeModal, setShowYoutubeModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [importingYoutube, setImportingYoutube] = useState(false);

  useEffect(() => {
    api.get('/adegas').then(({ data }) => {
      setAdegas(data || []);
      if (data?.[0]) setSelectedAdega(data[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedAdega) {
      api.get(`/media/adega/${selectedAdega}`).then(({ data }) => setMedia(data || [])).catch(() => {});
      api.get(`/schedules/adega/${selectedAdega}`).then(({ data }) => setSchedules(data.filter((s: any) => s.isActive))).catch(() => {});
    }
  }, [selectedAdega]);

  const uploadFile = async (file: File) => {
    if (!selectedAdega) { Toast.error('Selecione uma adega'); return; }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('adegaId', selectedAdega);
    try {
      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMedia(prev => [data, ...prev]);
      Toast.success('Arquivo enviado!');
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao enviar');
    } finally {
      setUploading(false);
    }
  };

  const deleteMedia = async (id: string) => {
    try {
      await api.delete(`/media/${id}`);
      setMedia(prev => prev.filter(m => m.id !== id));
      Toast.success('Arquivo removido');
    } catch {
      Toast.error('Erro ao remover');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Biblioteca de Mídia</h1>
          <p className="text-gray-500 text-sm">Faça upload de vídeos e imagens para suas TVs</p>
        </div>
        <div className="flex gap-3 items-center">
          <select value={selectedAdega} onChange={e => setSelectedAdega(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500 text-sm">
            <option value="">Selecione adega</option>
            {adegas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button onClick={() => setShowYoutubeModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
            ▶ YouTube
          </button>
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="px-4 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition font-medium disabled:opacity-50">
            {uploading ? 'Enviando...' : '+ Upload'}
          </button>
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,image/jpeg,image/png,image/webp"
            hidden onChange={e => { if (e.target.files?.[0]) uploadFile(e.target.files[0]); }} />
        </div>
      </div>

      {media.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">🎬</p>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum arquivo</h3>
          <p className="text-gray-500">Faça upload de vídeos e imagens para exibir nas TVs</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group">
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              {item.type === 'VIDEO' ? (
                <video src={item.url} className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">{(item.size / 1024 / 1024).toFixed(1)} MB</span>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedMedia(item); setShowAddToSchedule(true); }}
                    className="text-xs text-adega-600 opacity-0 group-hover:opacity-100 transition">Agendar</button>
                  <button onClick={() => deleteMedia(item.id)}
                    className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition">Remover</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddToSchedule && selectedMedia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddToSchedule(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Agendar Mídia</h2>
            <p className="text-sm text-gray-500 mb-4 truncate">{selectedMedia.name}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Agenda *</label>
                <select value={scheduleForm.scheduleId} onChange={e => setScheduleForm(f => ({ ...f, scheduleId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg outline-none text-sm">
                  <option value="">Selecione...</option>
                  {schedules.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {schedules.length === 0 && <p className="text-xs text-amber-600 mt-1">Crie uma agenda ativa primeiro</p>}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
                  <select value={scheduleForm.priority} onChange={e => setScheduleForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg outline-none text-sm">
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="EMERGENCY">Emergência</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Duração (s)</label>
                  <input type="number" value={scheduleForm.duration} onChange={e => setScheduleForm(f => ({ ...f, duration: +e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg outline-none text-sm" min={5} max={3600} />
                </div>
              </div>
              <button onClick={async () => {
                if (!scheduleForm.scheduleId) { Toast.error('Selecione uma agenda'); return; }
                try {
                  await api.post(`/schedules/${scheduleForm.scheduleId}/items`, {
                    mediaFileId: selectedMedia.id,
                    priority: scheduleForm.priority,
                    duration: scheduleForm.duration,
                  });
                  Toast.success('Mídia agendada com sucesso!');
                  setShowAddToSchedule(false);
                  setScheduleForm({ scheduleId: '', priority: 'NORMAL', duration: 10 });
                } catch (err: any) {
                  Toast.error(err.response?.data?.message || 'Erro ao agendar');
                }
              }}
                className="w-full py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 font-medium">
                Adicionar à Agenda
              </button>
            </div>
          </div>
        </div>
      )}

      {showYoutubeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowYoutubeModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Importar do YouTube</h2>
            <p className="text-sm text-gray-500 mb-4">Cole a URL do vídeo do YouTube para importar</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">URL do YouTube</label>
                <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>⚠️ O download pode levar alguns minutos dependendo do tamanho do vídeo.</p>
                <p>🎥 Formatos suportados: MP4 (melhor qualidade disponível)</p>
              </div>
              <button onClick={async () => {
                if (!youtubeUrl) { Toast.error('Cole a URL do YouTube'); return; }
                if (!selectedAdega) { Toast.error('Selecione uma adega'); return; }
                setImportingYoutube(true);
                try {
                  const { data } = await api.post('/media/import/youtube', { url: youtubeUrl, adegaId: selectedAdega });
                  setMedia(prev => [data, ...prev]);
                  setShowYoutubeModal(false);
                  setYoutubeUrl('');
                  Toast.success('Vídeo importado com sucesso!');
                } catch (err: any) {
                  Toast.error(err.response?.data?.message || 'Erro ao importar vídeo');
                }
                setImportingYoutube(false);
              }} disabled={importingYoutube}
                className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium">
                {importingYoutube ? 'Importando...' : '▶ Importar do YouTube'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
