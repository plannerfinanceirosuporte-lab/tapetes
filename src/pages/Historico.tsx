
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Historico: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      // Busca pedidos com todos os campos relevantes
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('id, created_at, total:total_amount, status, shipping_info')
        .eq('order_token', token)
        .order('created_at', { ascending: false });
      if (!error && ordersData) {
        // Para cada pedido, busca os itens
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order: any) => {
            const { data: items } = await supabase
              .from('order_items')
              .select('product_name, product_image, quantity')
              .eq('order_id', order.id);
            return { ...order, items: items || [] };
          })
        );
        setOrders(ordersWithItems);
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
          {orders.map(order => (
            <div key={order.id} className="border rounded-xl p-5 bg-white shadow flex flex-col gap-4">
              {/* Header do pedido */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b pb-2">
                <div>
                  <span className="font-semibold text-blue-700">Pedido #{order.id.slice(-8)}</span>
                  <span className="ml-3 text-gray-500 text-sm">{new Date(order.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status === 'pago' ? 'Pago' : 'Aguardando pagamento'}
                  </span>
                  <span className="font-bold text-blue-900 text-lg">R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              {/* Lista de produtos */}
              <div className="flex flex-col gap-2">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 border rounded p-2 bg-gray-50">
                    <img src={item.product_image || 'https://via.placeholder.com/64x64?text=Produto'} alt={item.product_name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.product_name}</div>
                      <div className="text-xs text-gray-500">Qtd: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Dados de envio, se houver */}
              {order.shipping_info && (
                <div className="bg-blue-50 rounded p-3 text-sm mt-2">
                  <div className="font-semibold text-blue-800 mb-1">Dados de Envio:</div>
                  {order.shipping_info.tracking_code && (
                    <div><span className="font-semibold">Rastreamento:</span> {order.shipping_info.tracking_code}</div>
                  )}
                  {order.shipping_info.address && (
                    <div><span className="font-semibold">Endereço:</span> {order.shipping_info.address}</div>
                  )}
                </div>
              )}
              {/* Botão de pagamento se aguardando */}
              {order.status === 'aguardando_pagamento' && (
                <button
                  className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition"
                  onClick={() => navigate(`/pagamento/${order.id}`)}
                >
                  Pagar Agora
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Historico;
