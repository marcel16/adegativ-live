'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Toast } from '@/components/toast';
import Image from 'next/image';

export default function SchedulePage() {
  const [adegas, setAdegas] = useState<any[]>([]);
  const [selectedAdega, setSelectedAdega] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [activeGuide, setActiveGuide] = useState(true);
  const [scheduleForm, setScheduleForm] = useState({ name: '', startDate: '', endDate: '', loopMode: 'SEQUENTIAL' });
  const [itemForm, setItemForm] = useState({
    mediaFileId: '', priority: 'NORMAL', dayOfWeek: '', startTime: '', endTime: '', duration: 10,
  });

  useEffect(() => {
    api.get('/adegas').then(({ data }) => {
      setAdegas(data || []);
      if (data?.[0]) setSelectedAdega(data[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedAdega) {
      api.get(`/schedules/adega/${selectedAdega}`).then(({ data }) => setSchedules(data || [])).catch(() => {});
      api.get(`/media/adega/${selectedAdega}`).then(({ data }) => setMediaLibrary(data || [])).catch(() => {});
    }
  }, [selectedAdega]);

  const createSchedule = async () => {
    try {
      const { data } = await api.post('/schedules', { ...scheduleForm, adegaId: selectedAdega });
      setSchedules(prev => [data, ...prev]);
      setShowScheduleModal(false);
      setScheduleForm({ name: '', startDate: '', endDate: '', loopMode: 'SEQUENTIAL' });
      Toast.success('Agenda criada!');
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao criar');
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await api.delete(`/schedules/${id}`);
      setSchedules(prev => prev.filter(s => s.id !== id));
      if (selectedSchedule?.id === id) setSelectedSchedule(null);
      Toast.success('Agenda removida');
    } catch {
      Toast.error('Erro ao remover');
    }
  };

  const toggleActive = async (schedule: any) => {
    try {
      const { data } = await api.put(`/schedules/${schedule.id}`, { isActive: !schedule.isActive });
      setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, isActive: data.isActive } : s));
      Toast.success(schedule.isActive ? 'Agenda pausada' : 'Agenda ativada');
    } catch {
      Toast.error('Erro ao atualizar');
    }
  };

  const addItem = async () => {
    if (!itemForm.mediaFileId) { Toast.error('Selecione uma mídia'); return; }
    if (!selectedSchedule) return;
    try {
      const payload: any = {
        mediaFileId: itemForm.mediaFileId,
        priority: itemForm.priority,
        duration: itemForm.duration,
      };
      if (itemForm.dayOfWeek) payload.dayOfWeek = parseInt(itemForm.dayOfWeek);
      if (itemForm.startTime) payload.startTime = itemForm.startTime;
      if (itemForm.endTime) payload.endTime = itemForm.endTime;
      const { data } = await api.post(`/schedules/${selectedSchedule.id}/items`, payload);
      setSchedules(prev => prev.map(s =>
        s.id === selectedSchedule.id ? { ...s, items: [...(s.items || []), data] } : s
      ));
      setShowItemModal(false);
      setItemForm({ mediaFileId: '', priority: 'NORMAL', dayOfWeek: '', startTime: '', endTime: '', duration: 10 });
      Toast.success('Item adicionado!');
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao adicionar');
    }
  };

  const removeItem = async (scheduleId: string, itemId: string) => {
    try {
      await api.delete(`/schedules/items/${itemId}`);
      setSchedules(prev => prev.map(s =>
        s.id === scheduleId ? { ...s, items: (s.items || []).filter((i: any) => i.id !== itemId) } : s
      ));
      Toast.success('Item removido');
    } catch {
      Toast.error('Erro ao remover');
    }
  };

  const inactiveSchedules = schedules.filter(s => !s.isActive);
  const activeSchedules = schedules.filter(s => s.isActive);

  return (
    <div className="max-w-5xl mx-auto">
      {activeGuide && (
        <div className="bg-gradient-to-r from-adega-50 to-blue-50 border border-adega-200 rounded-xl p-5 mb-6 relative">
          <button onClick={() => setActiveGuide(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">✕</button>
          <h3 className="font-semibold text-adega-800 mb-3">📺 Como exibir conteúdo na TV</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="bg-adega-600 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">1</span>
              <div><p className="font-medium text-gray-800">Upload de Mídia</p><p className="text-gray-500">Faça upload de vídeos e imagens na página Mídia</p></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-adega-600 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">2</span>
              <div><p className="font-medium text-gray-800">Criar Agenda</p><p className="text-gray-500">Crie uma agenda com nome e período de exibição</p></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-adega-600 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">3</span>
              <div><p className="font-medium text-gray-800">Adicionar Itens</p><p className="text-gray-500">Adicione suas mídias à agenda com prioridade e horário</p></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="bg-adega-600 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs font-bold">4</span>
              <div><p className="font-medium text-gray-800">Vincular TV</p><p className="text-gray-500">Pareie a TV e o conteúdo será exibido automaticamente</p></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agenda de Programação</h1>
          <p className="text-gray-500 text-sm">Adicione mídia às agendas para exibir nas TVs</p>
        </div>
        <div className="flex gap-3">
          <select value={selectedAdega} onChange={e => setSelectedAdega(e.target.value)}
            className="px-4 py-2 border rounded-lg outline-none text-sm">
            <option value="">Selecione adega</option>
            {adegas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <button onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition font-medium">
            + Nova Agenda
          </button>
        </div>
      </div>

      {!selectedAdega && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">📅</p>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Selecione uma adega</h3>
          <p className="text-gray-500">Escolha uma adega para gerenciar a programação</p>
        </div>
      )}

      {selectedAdega && schedules.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">📅</p>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhuma agenda</h3>
          <p className="text-gray-500 mb-2">Crie uma agenda e adicione itens de mídia para exibir nas TVs</p>
          <div className="text-sm text-gray-400 space-y-1">
            <p>💡 O conteúdo aparece automaticamente nas TVs vinculadas à adega</p>
            <p>📺 Use prioridades: EMERGENCY &gt; HIGH &gt; NORMAL</p>
            <p>⏰ Defina horários específicos ou deixe em branco para exibir sempre</p>
          </div>
        </div>
      )}

      {selectedAdega && (
        <div className="space-y-6">
          {activeSchedules.map(schedule => (
            <div key={schedule.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${schedule.isActive ? 'border-green-500' : 'border-gray-300'}`}>
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-800">{schedule.name}</h3>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Ativa</span>
                      {schedule.loopMode === 'RANDOM' && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">↺ Aleatório</span>
                      )}
                    </div>
                    {schedule.startDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(schedule.startDate).toLocaleDateString()}
                        {schedule.endDate ? ` até ${new Date(schedule.endDate).toLocaleDateString()}` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{schedule.items?.length || 0} itens</span>
                    <button onClick={async () => {
                      try {
                        const newMode = schedule.loopMode === 'RANDOM' ? 'SEQUENTIAL' : 'RANDOM';
                        await api.put(`/schedules/${schedule.id}`, { loopMode: newMode });
                        setSchedules(prev => prev.map(s => s.id === schedule.id ? { ...s, loopMode: newMode } : s));
                        Toast.success(newMode === 'RANDOM' ? 'Modo aleatório ativado' : 'Modo sequencial ativado');
                      } catch { Toast.error('Erro ao alterar modo'); }
                    }} className="text-xs text-purple-600 hover:text-purple-800 px-2 py-1">
                      {schedule.loopMode === 'RANDOM' ? 'Sequencial' : 'Aleatório ↺'}
                    </button>
                    <button onClick={() => toggleActive(schedule)} className="text-xs text-amber-600 hover:text-amber-800 px-2 py-1">Pausar</button>
                    <button onClick={() => deleteSchedule(schedule.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">Excluir</button>
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700">Itens da Agenda</h4>
                    <button onClick={() => { setSelectedSchedule(schedule); setShowItemModal(true); }}
                      className="text-xs px-3 py-1.5 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition font-medium">
                      + Adicionar Mídia
                    </button>
                  </div>
                  {(!schedule.items || schedule.items.length === 0) ? (
                    <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                      Nenhuma mídia adicionada. Clique em "Adicionar Mídia" para incluir conteúdo.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {schedule.items.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              item.priority === 'EMERGENCY' ? 'bg-red-500' :
                              item.priority === 'HIGH' ? 'bg-orange-500' : 'bg-blue-500'
                            }`} />
                            {item.mediaFile?.url?.match(/\.(mp4|webm)/i) ? (
                              <span className="text-lg">🎬</span>
                            ) : (
                              <span className="text-lg">🖼️</span>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item.mediaFile?.name || item.campaign?.name || 'Mídia'}</p>
                              <p className="text-xs text-gray-400">
                                {item.mediaFile?.type === 'VIDEO' ? 'Vídeo' : 'Imagem'} 
                                {item.duration && ` · ${item.duration}s`}
                                {item.startTime && ` · ${item.startTime}${item.endTime ? `-${item.endTime}` : ''}`}
                                {item.dayOfWeek !== null && item.dayOfWeek !== undefined && ` · Dia ${item.dayOfWeek}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                              item.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{item.priority}</span>
                            <button onClick={() => removeItem(schedule.id, item.id)}
                              className="text-xs text-red-500 opacity-0 group-hover:opacity-100 transition">Remover</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {activeSchedules.length > 0 && inactiveSchedules.length > 0 && (
            <hr className="border-gray-200" />
          )}

          {inactiveSchedules.map(schedule => (
            <div key={schedule.id} className="bg-white rounded-xl shadow-sm overflow-hidden border-l-4 border-gray-300 opacity-70">
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-600">{schedule.name}</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Pausada</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{schedule.items?.length || 0} itens</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(schedule)} className="text-xs text-adega-600 hover:text-adega-800 px-2 py-1">Ativar</button>
                    <button onClick={() => deleteSchedule(schedule.id)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">Excluir</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowScheduleModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Nova Agenda</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nome da agenda *</label>
                <input placeholder="Ex: Programação Happy Hour" value={scheduleForm.name} onChange={e => setScheduleForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Modo de exibição</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setScheduleForm(f => ({ ...f, loopMode: 'SEQUENTIAL' }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${scheduleForm.loopMode === 'SEQUENTIAL' ? 'bg-adega-600 text-white border-adega-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                    Sequencial
                  </button>
                  <button type="button" onClick={() => setScheduleForm(f => ({ ...f, loopMode: 'RANDOM' }))}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition ${scheduleForm.loopMode === 'RANDOM' ? 'bg-adega-600 text-white border-adega-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
                    Aleatório ↺
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {scheduleForm.loopMode === 'RANDOM' ? '↺ Os itens serão exibidos em ordem aleatória, sem sequência fixa' : '→ Os itens serão exibidos na ordem definida'}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Data início</label>
                  <input type="date" value={scheduleForm.startDate} onChange={e => setScheduleForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Data fim</label>
                  <input type="date" value={scheduleForm.endDate} onChange={e => setScheduleForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-adega-500" />
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">💡 Deixe as datas em branco para exibir indefinidamente</div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={createSchedule} disabled={!scheduleForm.name}
                  className="flex-1 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 disabled:opacity-50">Criar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showItemModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowItemModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Adicionar Mídia</h2>
              <span className="text-sm text-gray-400">Agenda: {selectedSchedule.name}</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {mediaLibrary.map(media => (
                <button key={media.id} onClick={() => setItemForm(f => ({ ...f, mediaFileId: media.id }))}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition ${
                    itemForm.mediaFileId === media.id ? 'border-adega-500 ring-2 ring-adega-200' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                  {media.type === 'VIDEO' ? (
                    <video src={media.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                    <p className="text-white text-xs truncate">{media.name}</p>
                  </div>
                  {itemForm.mediaFileId === media.id && (
                    <div className="absolute top-1 right-1 bg-adega-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</div>
                  )}
                </button>
              ))}
            </div>
            {mediaLibrary.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                Nenhuma mídia disponível. Faça upload em <a href="/dashboard/media" className="text-adega-600 underline">Mídia</a> primeiro.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Prioridade</label>
                <select value={itemForm.priority} onChange={e => setItemForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg outline-none text-sm">
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">Alta</option>
                  <option value="EMERGENCY">Emergência</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Duração (segundos)</label>
                <input type="number" value={itemForm.duration} onChange={e => setItemForm(f => ({ ...f, duration: +e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg outline-none text-sm" min={5} max={3600} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Dia da semana</label>
                <select value={itemForm.dayOfWeek} onChange={e => setItemForm(f => ({ ...f, dayOfWeek: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg outline-none text-sm">
                  <option value="">Todos os dias</option>
                  <option value="0">Domingo</option>
                  <option value="1">Segunda</option>
                  <option value="2">Terça</option>
                  <option value="3">Quarta</option>
                  <option value="4">Quinta</option>
                  <option value="5">Sexta</option>
                  <option value="6">Sábado</option>
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Início</label>
                  <input type="time" value={itemForm.startTime} onChange={e => setItemForm(f => ({ ...f, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg outline-none text-sm" />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Fim</label>
                  <input type="time" value={itemForm.endTime} onChange={e => setItemForm(f => ({ ...f, endTime: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg outline-none text-sm" />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowItemModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancelar</button>
              <button onClick={addItem} disabled={!itemForm.mediaFileId}
                className="flex-1 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 disabled:opacity-50 font-medium">
                Adicionar à Agenda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
