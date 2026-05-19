'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ adegas: 0, tvs: 0, media: 0, status: 'carregando...' });

  useEffect(() => {
    api.get('/users/companies').then(({ data }) => {
      const companies = data || [];
      const adegas = companies.flatMap((c: any) => c.adegas || []);
      const tvs = adegas.flatMap((a: any) => a.tvDevices || []);
      const media = adegas.reduce((acc: number, a: any) => acc + (a._count?.mediaFiles || 0), 0);
      const sub = companies[0]?.subscriptions?.[0];
      setStats({ adegas: adegas.length, tvs: tvs.length, media, status: sub?.status || 'sem plano' });
    }).catch(() => {});
  }, []);

  const cards = [
    { label: 'Adegas', value: stats.adegas, color: 'bg-blue-500', href: '/dashboard/adegas' },
    { label: 'TVs', value: stats.tvs, color: 'bg-green-500', href: '/dashboard/tvs' },
    { label: 'Arquivos de Mídia', value: stats.media, color: 'bg-purple-500', href: '/dashboard/media' },
    { label: 'Assinatura', value: stats.status, color: stats.status === 'ACTIVE' || stats.status === 'TRIAL' ? 'bg-adega-500' : 'bg-red-500', href: '#' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Bem-vindo, {user?.name}!</h1>
      <p className="text-gray-500 mb-6">Gerencie suas adegas e conteúdos de TV</p>

      <div className="bg-gradient-to-r from-adega-600 to-adega-800 rounded-xl p-6 text-white mb-8 shadow-lg">
        <h2 className="text-lg font-bold mb-4">📺 Como exibir conteúdo na TV</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-black mb-1">1</div>
            <div className="font-semibold text-sm">Upload de Mídia</div>
            <div className="text-xs text-white/70 mt-1">Envie vídeos e imagens</div>
            <a href="/dashboard/media" className="text-xs text-adega-200 underline mt-2 inline-block">Ir para Mídia →</a>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-black mb-1">2</div>
            <div className="font-semibold text-sm">Criar Playlist</div>
            <div className="text-xs text-white/70 mt-1">Organize seus conteúdos</div>
            <a href="/dashboard/playlists" className="text-xs text-adega-200 underline mt-2 inline-block">Ir para Playlists →</a>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-black mb-1">3</div>
            <div className="font-semibold text-sm">Agendar Exibição</div>
            <div className="text-xs text-white/70 mt-1">Programe quando exibir</div>
            <a href="/dashboard/schedule" className="text-xs text-adega-200 underline mt-2 inline-block">Ir para Agenda →</a>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-black mb-1">4</div>
            <div className="font-semibold text-sm">Vincular TV</div>
            <div className="text-xs text-white/70 mt-1">Conecte sua TV e pronto!</div>
            <a href="/dashboard/tvs" className="text-xs text-adega-200 underline mt-2 inline-block">Ir para TVs →</a>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
            <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
              <span className="text-white text-xl font-bold">{card.label.charAt(0)}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>
      {stats.status === 'TRIAL' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-700 font-medium">📢 Período de teste ativo</p>
          <p className="text-amber-600 text-sm mt-1">Seu trial de 3 dias está ativo. Após o período, escolha um plano para continuar exibindo conteúdo nas TVs.</p>
        </div>
      )}
      {stats.status === 'EXPIRED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">⚠️ Assinatura vencida</p>
          <p className="text-red-600 text-sm mt-1">Seu período de teste expirou. Contrate um plano para reativar a exibição nas TVs.</p>
        </div>
      )}
    </div>
  );
}
