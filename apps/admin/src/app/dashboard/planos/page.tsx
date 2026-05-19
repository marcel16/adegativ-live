'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  priceYearly: number;
  annualDiscountPercent: number;
  maxTvs: number;
  maxAdegas: number;
  maxStorageGb: number;
  hasScheduling: boolean;
  hasAnalytics: boolean;
  hasYoutubeImport: boolean;
  hasAiFeatures: boolean;
  features: any;
  isHighlighted: boolean;
  status: string;
  sortOrder: number;
}

const emptyForm = {
  name: '', description: '', priceMonthly: 0, priceYearly: 0, annualDiscountPercent: 17,
  maxTvs: 2, maxAdegas: 1, maxStorageGb: 5,
  hasScheduling: true, hasAnalytics: false, hasYoutubeImport: false, hasAiFeatures: false,
  isHighlighted: false, sortOrder: 0, status: 'ACTIVE', features: '[]',
};

export default function AdminPlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const loadPlans = async () => {
    try {
      const { data } = await api.get('/plans/admin/all');
      setPlans(data);
    } catch { }
  };

  useEffect(() => { loadPlans(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setForm({
      ...plan,
      description: plan.description || '',
      features: plan.features ? JSON.stringify(plan.features) : '[]',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.id;
      delete payload.createdAt;
      delete payload.updatedAt;
      try { payload.features = JSON.parse(payload.features); } catch { payload.features = []; }
      payload.priceMonthly = Number(payload.priceMonthly);
      payload.priceYearly = Number(payload.priceYearly);
      payload.annualDiscountPercent = Number(payload.annualDiscountPercent);
      payload.maxTvs = Number(payload.maxTvs);
      payload.maxAdegas = Number(payload.maxAdegas);
      payload.maxStorageGb = Number(payload.maxStorageGb);
      payload.sortOrder = Number(payload.sortOrder);

      if (editingId) {
        await api.put(`/plans/${editingId}`, payload);
      } else {
        await api.post('/plans', payload);
      }
      setShowModal(false);
      await loadPlans();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao salvar plano');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Arquivar este plano?')) return;
    try {
      await api.delete(`/plans/${id}`);
      await loadPlans();
    } catch { }
  };

  const toggleStatus = async (plan: Plan) => {
    try {
      await api.put(`/plans/${plan.id}`, { status: plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      await loadPlans();
    } catch { }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gerenciar Planos</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-adega-600 text-white rounded-lg hover:bg-adega-700 transition text-sm font-medium">
          + Novo Plano
        </button>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-xl shadow-sm border p-6 ${plan.status !== 'ACTIVE' ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{plan.name}</h3>
                  {plan.isHighlighted && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">Destaque</span>}
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${plan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{plan.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-gray-400">Mensal:</span> <span className="font-semibold">R$ {Number(plan.priceMonthly).toFixed(2)}</span></div>
                  <div><span className="text-gray-400">Anual:</span> <span className="font-semibold">R$ {Number(plan.priceYearly).toFixed(2)}</span></div>
                  {plan.annualDiscountPercent > 0 && <div><span className="text-green-600 font-medium">{-plan.annualDiscountPercent}% anual</span></div>}
                  <div><span className="text-gray-400">TVs:</span> <span className="font-semibold">{plan.maxTvs === 999 ? '∞' : plan.maxTvs}</span></div>
                  <div><span className="text-gray-400">Adegas:</span> <span className="font-semibold">{plan.maxAdegas === 999 ? '∞' : plan.maxAdegas}</span></div>
                  <div><span className="text-gray-400">Armazenamento:</span> <span className="font-semibold">{plan.maxStorageGb}GB</span></div>
                  <div><span className="text-gray-400">Ordem:</span> <span className="font-semibold">{plan.sortOrder}</span></div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-gray-500">
                  <span className={plan.hasScheduling ? 'text-green-600' : ''}>📅 Agendamento {plan.hasScheduling ? '✓' : '✗'}</span>
                  <span className={plan.hasAnalytics ? 'text-green-600' : ''}>📊 Analytics {plan.hasAnalytics ? '✓' : '✗'}</span>
                  <span className={plan.hasYoutubeImport ? 'text-green-600' : ''}>▶ YouTube {plan.hasYoutubeImport ? '✓' : '✗'}</span>
                  <span className={plan.hasAiFeatures ? 'text-green-600' : ''}>🤖 IA {plan.hasAiFeatures ? '✓' : '✗'}</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button onClick={() => toggleStatus(plan)} className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50 transition" title="Ativar/Inativar">
                  {plan.status === 'ACTIVE' ? '🟢' : '⭕'}
                </button>
                <button onClick={() => openEdit(plan)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                  Editar
                </button>
                <button onClick={() => handleArchive(plan.id)} className="px-3 py-1.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition">
                  Arquivar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Plano' : 'Novo Plano'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Preço Mensal (R$)</label>
                <input type="number" step="0.01" value={form.priceMonthly} onChange={e => setForm({ ...form, priceMonthly: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Preço Anual (R$)</label>
                <input type="number" step="0.01" value={form.priceYearly} onChange={e => setForm({ ...form, priceYearly: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Desconto Anual (%)</label>
                <input type="number" value={form.annualDiscountPercent} onChange={e => setForm({ ...form, annualDiscountPercent: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Máx. TVs</label>
                <input type="number" value={form.maxTvs} onChange={e => setForm({ ...form, maxTvs: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Máx. Adegas</label>
                <input type="number" value={form.maxAdegas} onChange={e => setForm({ ...form, maxAdegas: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Armazenamento (GB)</label>
                <input type="number" value={form.maxStorageGb} onChange={e => setForm({ ...form, maxStorageGb: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="ARCHIVED">Arquivado</option>
                </select></div>
              <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Features (JSON array)</label>
                <input value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" /></div>
              <div className="col-span-2 flex gap-6 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasScheduling} onChange={e => setForm({ ...form, hasScheduling: e.target.checked })} /> Agendamento</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasAnalytics} onChange={e => setForm({ ...form, hasAnalytics: e.target.checked })} /> Analytics</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasYoutubeImport} onChange={e => setForm({ ...form, hasYoutubeImport: e.target.checked })} /> YouTube</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.hasAiFeatures} onChange={e => setForm({ ...form, hasAiFeatures: e.target.checked })} /> IA</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isHighlighted} onChange={e => setForm({ ...form, isHighlighted: e.target.checked })} /> Destaque</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-adega-600 text-white rounded-lg text-sm hover:bg-adega-700 transition disabled:opacity-50">
                {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
