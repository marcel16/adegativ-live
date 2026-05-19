'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Toaster, toast } from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user?.role !== 'ADMIN') {
        toast.error('Acesso restrito a administradores');
        return;
      }
      localStorage.setItem('adminToken', data.accessToken);
      localStorage.setItem('adminRefresh', data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 to-gray-900">
      <Toaster position="top-right" />
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">Admin</h1>
          <p className="text-gray-500 mt-2">AdegaTV Live</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required
            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50">
            {loading ? 'Entrando...' : 'Entrar no Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
