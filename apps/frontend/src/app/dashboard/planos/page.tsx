'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Toast } from '@/components/toast';

interface Plan {
  id: string;
  name: string;
  description: string;
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
  isHighlighted: boolean;
  status: string;
}

interface SubscriptionInfo {
  status: string;
  plan: { name: string } | null;
  trialEndsAt: string;
}

export default function PlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/plans'),
      api.get('/users/companies'),
      api.get('/users/me'),
    ]).then(([plansRes, companiesRes, userRes]) => {
      setPlans(plansRes.data.filter((p: Plan) => p.status === 'ACTIVE'));
      setUserEmail(userRes.data?.email || '');
      setUserName(userRes.data?.name || '');
      const companies = companiesRes.data || [];
      if (companies.length > 0) {
        setCompanyId(companies[0].id);
        const s = companies[0].subscriptions?.[0];
        if (s) {
          setSub({
            status: s.status,
            plan: s.plan || null,
            trialEndsAt: s.trialEndsAt,
          });
          setSubscriptionId(s.id);
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleStripeCheckout = async (plan: Plan, selectedInterval: 'month' | 'year') => {
    if (!subscriptionId || !companyId) {
      Toast.error('Nenhuma assinatura encontrada');
      return;
    }
    setCheckoutLoading(plan.id);
    try {
      const { data } = await api.post('/payments/checkout/stripe', {
        subscriptionId,
        planId: plan.id,
        planName: plan.name,
        amount: selectedInterval === 'month' ? plan.priceMonthly : plan.priceYearly,
        interval: selectedInterval,
        companyId,
        email: userEmail,
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao iniciar checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleAsaasCheckout = async (plan: Plan, selectedInterval: 'month' | 'year') => {
    if (!subscriptionId) {
      Toast.error('Nenhuma assinatura encontrada');
      return;
    }
    setCheckoutLoading(plan.id);
    try {
      const { data } = await api.post('/payments/checkout/asaas', {
        subscriptionId,
        customerName: userName,
        customerEmail: userEmail,
        amount: selectedInterval === 'month' ? plan.priceMonthly : plan.priceYearly,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `Plano ${plan.name} - ${selectedInterval === 'month' ? 'Mensal' : 'Anual'}`,
        billingType: 'PIX',
      });
      if (data.invoiceUrl) {
        window.open(data.invoiceUrl, '_blank');
      }
      if (data.pixCopyPaste) {
        await navigator.clipboard.writeText(data.pixCopyPaste);
        Toast.success('Código PIX copiado!');
      }
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao gerar pagamento');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-adega-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Planos</h1>
      <p className="text-gray-500 mb-6">Escolha o plano ideal para sua adega</p>

      {sub?.status === 'TRIAL' && sub.trialEndsAt && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-700 font-medium">
            🎯 Período de teste ativo até {new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setInterval('month')}
          className={`px-6 py-2 rounded-lg font-medium transition ${interval === 'month' ? 'bg-adega-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Mensal
        </button>
        <button
          onClick={() => setInterval('year')}
          className={`px-6 py-2 rounded-lg font-medium transition ${interval === 'year' ? 'bg-adega-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Anual
          {plans.some(p => p.annualDiscountPercent > 0) && (
            <span className="ml-1 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">-{Math.max(...plans.map(p => p.annualDiscountPercent))}%</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = interval === 'month' ? plan.priceMonthly : plan.priceYearly;
          const isCurrentPlan = sub?.plan?.name === plan.name && sub?.status !== 'EXPIRED';
          const isFree = price === 0;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-sm border-2 p-6 flex flex-col transition ${
                isCurrentPlan ? 'border-adega-500 shadow-lg' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 self-start mb-3">
                {isCurrentPlan && (
                  <span className="text-xs font-semibold text-adega-700 bg-adega-50 px-3 py-1 rounded-full">
                    Plano Atual
                  </span>
                )}
                {plan.isHighlighted && (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                    Mais Popular
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>
              <p className="text-gray-500 text-sm mt-1 mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800">{formatPrice(price)}</span>
                <span className="text-gray-500 text-sm ml-1">/{interval === 'month' ? 'mês' : 'ano'}</span>
                {interval === 'year' && plan.annualDiscountPercent > 0 && (
                  <div className="mt-1 text-xs text-green-600 font-medium">Economia de {plan.annualDiscountPercent}%</div>
                )}
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> Até {plan.maxTvs >= 999 ? 'ilimitadas' : `${plan.maxTvs} ${plan.maxTvs === 1 ? 'TV' : 'TVs'}`}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> Até {plan.maxAdegas >= 999 ? 'ilimitadas' : `${plan.maxAdegas} ${plan.maxAdegas === 1 ? 'filial' : 'filiais'}`}
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-500">✓</span> {plan.maxStorageGb}GB de armazenamento
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={plan.hasScheduling ? 'text-green-500' : 'text-gray-300'}>
                    {plan.hasScheduling ? '✓' : '✗'}
                  </span> Agendamento de conteúdo
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={plan.hasAnalytics ? 'text-green-500' : 'text-gray-300'}>
                    {plan.hasAnalytics ? '✓' : '✗'}
                  </span> Analytics
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={plan.hasYoutubeImport ? 'text-green-500' : 'text-gray-300'}>
                    {plan.hasYoutubeImport ? '✓' : '✗'}
                  </span> Importação YouTube
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={plan.hasAiFeatures ? 'text-green-500' : 'text-gray-300'}>
                    {plan.hasAiFeatures ? '✓' : '✗'}
                  </span> IA Generativa
                </li>
              </ul>
              {isCurrentPlan ? (
                <span className="block w-full text-center py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-default">
                  Plano Atual
                </span>
              ) : isFree ? (
                <span className="block w-full text-center py-3 rounded-lg font-semibold bg-gray-100 text-gray-500 cursor-default">
                  Gratuito
                </span>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleStripeCheckout(plan, interval)}
                    disabled={checkoutLoading === plan.id}
                    className="w-full py-3 bg-adega-600 text-white rounded-lg font-semibold hover:bg-adega-700 transition disabled:opacity-50"
                  >
                    {checkoutLoading === plan.id ? 'Aguarde...' : 'Assinar com Cartão'}
                  </button>
                  <button
                    onClick={() => handleAsaasCheckout(plan, interval)}
                    disabled={checkoutLoading === plan.id}
                    className="w-full py-2.5 border border-adega-600 text-adega-600 rounded-lg font-medium hover:bg-adega-50 transition disabled:opacity-50 text-sm"
                  >
                    Pagar com PIX ou Boleto
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
