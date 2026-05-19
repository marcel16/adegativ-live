'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { Toast } from '@/components/toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      Toast.success('Conta criada! Trial de 3 dias ativado.');
      router.push('/dashboard');
    } catch (err: any) {
      Toast.error(err.response?.data?.message || 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-adega-900 via-adega-800 to-primary-900">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-adega-800">AdegaTV Live</h1>
          <p className="text-gray-500 mt-2">Crie sua conta gratuita por 3 dias</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adega-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adega-500 focus:border-transparent outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adega-500 focus:border-transparent outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-adega-600 text-white rounded-lg font-semibold hover:bg-adega-700 transition disabled:opacity-50">
            {loading ? 'Criando conta...' : 'Criar conta gratuita'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-adega-600 font-semibold hover:underline">Fazer login</Link>
        </p>
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-700 text-center">
            Trial gratuito de 3 dias. Sem compromisso. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}
