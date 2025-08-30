import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { mockProducts } from '../lib/mockData';
import { useNavigate } from 'react-router-dom';

const Historico: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState<{ [orderId: string]: any[] }>({});
  const navigate = useNavigate();

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
      if (!error && data) {
        setOrders(data);
        // Buscar itens de todos os pedidos
        const orderIds = data.map((o: any) => o.id);
        if (orderIds.length > 0) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('order_id, product_id, product_name, quantity, product_price')
            .in('order_id', orderIds);
          if (!itemsError && itemsData) {
            // Agrupar por order_id
            const grouped: { [orderId: string]: any[] } = {};
            itemsData.forEach(item => {
              if (!grouped[item.order_id]) grouped[item.order_id] = [];
              grouped[item.order_id].push(item);
            });
            setOrderItems(grouped);
          }
        }
      }
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
          {orders.map(order => {
            const items = orderItems[order.id] || [];
            return (
              <div key={order.id} className="border rounded-xl p-5 bg-white shadow flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-700">Pedido #{order.id.slice(-8)}</span>
                  <span className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="mb-1 text-sm text-gray-700">Status: <span className={`font-medium ${order.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>{order.status === 'confirmed' ? 'Pago' : 'Pendente'}</span></div>
                <div className="mb-2">
                  <span className="text-sm font-semibold">Entrega: </span>
                  <span className="text-sm">
                    {order.status === 'confirmed' ? 'Preparando Pedido Para Envio' : 'Aguardando pagamento'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map(item => {
                    // Buscar imagem e nome do produto
                    const product = mockProducts.find(p => p.id === String(item.product_id));
                    return (
                      <div key={item.product_id} className="flex items-center gap-3 border rounded p-2 bg-gray-50">
                        <img src={product?.image_url} alt={product?.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{product?.name || item.product_name}</div>
                          <div className="text-xs text-gray-500">Qtd: {item.quantity}</div>
                        </div>
                        <div className="font-semibold text-blue-700">R$ {Number(item.product_price).toFixed(2).replace('.', ',')}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-lg text-blue-900">Total: R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</span>
                  {order.status !== 'confirmed' && (
                    <button
                      className="ml-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition"
                      onClick={() => navigate(`/order-confirmation?orderId=${order.id}`)}
                    >
                      Pagar Agora
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Historico;
