import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const Historico: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('order_token');
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, total_amount')
        .eq('order_token', token)
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Histórico de Compras</h1>
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 bg-white rounded-lg shadow p-8">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border rounded-xl p-5 bg-white shadow flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-blue-700">Pedido #{order.id.slice(-8)}</span>
                <span className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="mb-1 text-sm text-gray-700">Status: <span className={`font-medium ${order.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>{order.status === 'confirmed' ? 'Pago' : 'Pendente'}</span></div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-lg text-blue-900">Total: R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Historico;
