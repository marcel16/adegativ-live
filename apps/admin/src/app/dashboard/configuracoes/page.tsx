'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface Setting {
  id: string;
  key: string;
  value: string | null;
  group: string;
  type: string;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
}

const groupLabels: Record<string, string> = {
  stripe: 'Stripe',
  asaas: 'Asaas',
  app: 'Aplicação',
  storage: 'Armazenamento',
  smtp: 'SMTP / E-mail',
};

const groupIcons: Record<string, string> = {
  stripe: '💳',
  asaas: '🏦',
  app: '⚙️',
  storage: '💾',
  smtp: '📧',
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSettings();
    setOpenGroups({ stripe: true, asaas: true, app: true, storage: false, smtp: false });
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      setSettings(data || []);
      const initial: Record<string, string> = {};
      (data || []).forEach((s: Setting) => { initial[s.key] = s.value || ''; });
      setEdited(initial);
    } catch { toast.error('Erro ao carregar configurações'); }
  };

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  const hasChanges = settings.some(s => edited[s.key] !== (s.value || ''));

  const saveAll = async () => {
    setSaving(true);
    try {
      const changes = settings.filter(s => edited[s.key] !== (s.value || '')).map(s => ({ key: s.key, value: edited[s.key] }));
      if (changes.length === 0) { toast('Nenhuma alteração'); setSaving(false); return; }
      await api.put('/settings', { settings: changes });
      toast.success('Configurações salvas!');
      loadSettings();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as configurações do sistema</p>
        </div>
        <button onClick={saveAll} disabled={!hasChanges || saving}
          className={`px-6 py-2 rounded-lg transition font-medium ${hasChanges && !saving ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
          {saving ? 'Salvando...' : hasChanges ? 'Salvar alterações' : 'Salvo'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button onClick={() => setOpenGroups(o => ({ ...o, [group]: !o[group] }))}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <span className="text-xl">{groupIcons[group] || '📁'}</span>
                <h2 className="text-lg font-semibold text-gray-800">{groupLabels[group] || group}</h2>
              </div>
              <span className={`text-gray-400 transition-transform ${openGroups[group] ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openGroups[group] && (
              <div className="px-6 pb-4 space-y-4">
                {items.map(setting => (
                  <div key={setting.id}>
                    <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                      {setting.key.replace(/_/g, ' ')}
                      {setting.isSecret && <span className="text-xs text-orange-500 ml-2">(secreto)</span>}
                    </label>
                    <input type={setting.isSecret ? 'password' : 'text'}
                      value={edited[setting.key] ?? ''}
                      onChange={e => setEdited(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      placeholder={setting.isSecret ? 'Chave secreta não configurada' : ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
