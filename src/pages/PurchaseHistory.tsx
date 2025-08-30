import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PurchaseHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, total_amount, status, order_items(*, product:products(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (!user) return <div className="p-8 text-center">Faça login para ver seu histórico de compras.</div>;
  if (loading) return <div className="p-8 text-center">Carregando...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Histórico de Compras</h1>
      {orders.length === 0 ? (
        <div className="text-gray-500">Nenhuma compra encontrada.</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Pedido #{order.id.slice(-8)}</span>
                <span className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="mb-2 text-sm text-gray-700">Status: <span className="font-medium">{order.status === 'confirmed' ? 'Pago' : 'Pendente'}</span></div>
              <div className="mb-2">
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-2 mb-1">
                    <img src={item.product?.image_url || '/placeholder.png'} alt={item.product?.name} className="w-10 h-10 object-cover rounded" />
                    <span>{item.product?.name}</span>
                    <span className="text-xs text-gray-500">Qtd: {item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">Total: R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
