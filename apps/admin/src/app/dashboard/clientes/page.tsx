'use client';

import { useEffect, useState } from 'react';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(console.log).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h1>
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <p className="text-4xl mb-4">👥</p>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Gestão de Clientes</h3>
        <p className="text-gray-500">Gerencie todos os clientes da plataforma</p>
      </div>
    </div>
  );
}
