'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Toast } from '@/components/toast';

export default function PlaylistsPage() {
  const [adegas, setAdegas] = useState<any[]>([]);
  const [selectedAdega, setSelectedAdega] = useState('');
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMediaModal, setShowAddMediaModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [name, setName] = useState('');
  const [addForm, setAddForm] = useState({ mediaFileId: '', scheduleId: '', priority: 'NORMAL', duration: 10 });
  const [playlistItems, setPlaylistItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/adegas').then(({ data }) => {
      setAdegas(data || []);
      if (data?.[0]) setSelectedAdega(data[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedAdega) {
      api.get(`/playlists/adega/${selectedAdega}`).then(({ data }) => setPlaylists(data || [])).catch(() => {});
      api.get(`/schedules/adega/${selectedAdega}`).then(({ data }) => setSchedules(data || [])).catch(() => {});
      api.get(`/media/adega/${selectedAdega}`).then(({ data }) => setMediaLibrary(data || [])).catch(() => {});
    }
  }, [selectedAdega, selectedPlaylist]);

  const createPlaylist = async () => {
    try {
      const { data } = await api.post('/playlists', { adegaId: selectedAdega, name });
      setPlaylists(prev => [data, ...prev]);
      setShowCreateModal(false);
      setName('');
      Toast.success('Playlist criada!');
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao criar');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/playlists/${id}`, { isActive: !isActive });
      setPlaylists(prev => prev.map(p => p.id === id ? { ...p, isActive: !isActive } : p));
      Toast.success(isActive ? 'Playlist pausada' : 'Playlist ativada');
    } catch {
      Toast.error('Erro ao atualizar');
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      await api.delete(`/playlists/${id}`);
      setPlaylists(prev => prev.filter(p => p.id !== id));
      if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
      Toast.success('Playlist removida');
    } catch {
      Toast.error('Erro ao remover');
    }
  };

  const loadPlaylistItems = async (playlist: any) => {
    setSelectedPlaylist(playlist);
    try {
      const { data } = await api.get(`/playlists/${playlist.id}`);
      setPlaylistItems(data.scheduleItems || []);
    } catch {
      setPlaylistItems([]);
    }
  };

  const addMediaToPlaylist = async () => {
    if (!addForm.mediaFileId || !addForm.scheduleId) {
      Toast.error('Selecione a mídia e a agenda');
      return;
    }
    try {
      await api.post(`/schedules/${addForm.scheduleId}/items`, {
        mediaFileId: addForm.mediaFileId,
        playlistId: selectedPlaylist.id,
        priority: addForm.priority,
        duration: addForm.duration,
      });
      Toast.success('Mídia adicionada à playlist!');
      setShowAddMediaModal(false);
      setAddForm({ mediaFileId: '', scheduleId: '', priority: 'NORMAL', duration: 10 });
      if (selectedPlaylist) loadPlaylistItems(selectedPlaylist);
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao adicionar');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/schedules/items/${itemId}`);
      setPlaylistItems(prev => prev.filter(i => i.id !== itemId));
      Toast.success('Item removido da playlist');
    } catch {
      Toast.error('Erro ao remover');
    }
  };

  const activeSchedules = schedules.filter((s: any) => s.isActive);

  return (
    <div className="max-w-5xl mx-auto">
      {!selectedPlaylist ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Playlists</h1>
              <p className="text-gray-500 text-sm">Organize seus conteúdos em grupos para exibição nas TVs</p>
            </div>
            <div className="flex gap-3">
              <select value={selectedAdega} onChange={e => setSelectedAdega(e.target.value)}
                className="px-4 py-2 border rounded-lg outline-none text-sm">
                <option value="">Selecione adega</option>
                {adegas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <button onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition font-medium">
                + Nova Playlist
              </button>
            </div>
          </div>

          {playlists.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <p className="text-4xl mb-4">📋</p>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma playlist</h3>
              <p className="text-gray-500 mb-3">Crie playlists para agrupar conteúdos e facilitar a programação</p>
              <div className="text-sm text-gray-400 space-y-1">
                <p>💡 Playlists são grupos de mídia que você pode reutilizar em várias agendas</p>
                <p>📺 Após criar, adicione mídias e associe a uma agenda para exibir na TV</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map(playlist => (
              <div key={playlist.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition border-l-4 border-transparent hover:border-adega-400 cursor-pointer"
                onClick={() => loadPlaylistItems(playlist)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{playlist.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{playlist._count?.scheduleItems || 0} itens</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); toggleActive(playlist.id, playlist.isActive); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${playlist.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {playlist.isActive ? 'Ativo' : 'Pausado'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); deletePlaylist(playlist.id); }}
                      className="text-xs text-red-500 hover:text-red-700">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button onClick={() => setSelectedPlaylist(null)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
            ← Voltar para Playlists
          </button>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-adega-500">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-800">{selectedPlaylist.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedPlaylist.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedPlaylist.isActive ? 'Ativo' : 'Pausado'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{playlistItems.length} mídia(s) nesta playlist</p>
                </div>
                <button onClick={() => {
                  if (activeSchedules.length === 0) {
                    Toast.error('Crie uma agenda ativa primeiro');
                    return;
                  }
                  setAddForm(f => ({ ...f, scheduleId: activeSchedules[0]?.id || '' }));
                  setShowAddMediaModal(true);
                }}
                  className="px-4 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition font-medium text-sm">
                  + Adicionar Mídia
                </button>
              </div>

              <div className="mt-4 border-t pt-4">
                <div className="text-xs text-gray-400 mb-3">
                  💡 As mídias aqui serão adicionadas a uma agenda e exibidas nas TVs vinculadas à adega
                </div>
                <div className="space-y-2">
                  {playlistItems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-lg">
                      Nenhuma mídia nesta playlist. Clique em "Adicionar Mídia" para incluir.
                    </p>
                  ) : (
                    playlistItems.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group">
                        <div className="flex items-center gap-3 flex-1">
                          {item.mediaFile?.type === 'VIDEO' ? (
                            <span className="text-lg">🎬</span>
                          ) : (
                            <span className="text-lg">🖼️</span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {item.mediaFile?.name || 'Mídia'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.schedule?.name ? `Agenda: ${item.schedule.name}` : ''}
                              {item.priority && ` · ${item.priority}`}
                              {item.duration && ` · ${item.duration}s`}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)}
                          className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition ml-2 shrink-0">
                          Remover
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Nova Playlist</h2>
            <input placeholder="Nome da playlist" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={createPlaylist}
                className="flex-1 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700">Criar</button>
            </div>
          </div>
        </div>
      )}

      {showAddMediaModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddMediaModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Adicionar Mídia à Playlist</h2>
            <p className="text-sm text-gray-400 mb-4">Playlist: {selectedPlaylist.name}</p>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {mediaLibrary.map(media => (
                <button key={media.id} onClick={() => setAddForm(f => ({ ...f, mediaFileId: media.id }))}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                    addForm.mediaFileId === media.id ? 'border-adega-500 ring-2 ring-adega-200' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {media.type === 'VIDEO' ? (
                    <video src={media.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                    <p className="text-white text-xs truncate">{media.name}</p>
                  </div>
                  {addForm.mediaFileId === media.id && (
                    <div className="absolute top-1 right-1 bg-adega-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>
            {mediaLibrary.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">
                Nenhuma mídia disponível. Faça upload em <a href="/dashboard/media" className="text-adega-600 underline">Mídia</a>.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Agenda de destino *</label>
                <select value={addForm.scheduleId} onChange={e => setAddForm(f => ({ ...f, scheduleId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg outline-none text-sm">
                  <option value="">Selecione...</option>
                  {activeSchedules.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {activeSchedules.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">Crie uma agenda ativa em Agenda de Programação primeiro</p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
                <select value={addForm.priority} onChange={e => setAddForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg outline-none text-sm">
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Alta</option>
                  <option value="EMERGENCY">Emergência</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Duração (s)</label>
                <input type="number" value={addForm.duration} onChange={e => setAddForm(f => ({ ...f, duration: +e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg outline-none text-sm" min={5} max={3600} />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowAddMediaModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={addMediaToPlaylist} disabled={!addForm.mediaFileId || !addForm.scheduleId}
                className="flex-1 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 disabled:opacity-50 font-medium">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
