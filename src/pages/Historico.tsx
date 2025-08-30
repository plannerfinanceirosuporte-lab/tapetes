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
  .select('id, created_at, updated_at, status, total_amount')
        .eq('order_token', token)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setOrders(data);
        // Buscar itens de todos os pedidos pagos
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
                <div className="mb-1 text-xs text-gray-500">
                  Pago em: {order.updated_at ? new Date(order.updated_at).toLocaleString('pt-BR') : '-'}
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
                    let imageUrl = '';
                    if (item.image_url) imageUrl = item.image_url;
                    else if (product?.image_url) imageUrl = product.image_url;
                    else imageUrl = 'https://via.placeholder.com/64x64?text=Produto';
                    const name = product?.name || item.product_name || 'Produto';
                    return (
                      <div key={item.product_id} className="flex items-center gap-3 border rounded p-2 bg-gray-50">
                        <img src={imageUrl} alt={name} className="w-16 h-16 object-cover rounded" style={{ background: '#eee' }} />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{name}</div>
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
                      onClick={async () => {
                        if (!supabase) {
                          alert('Supabase não configurado.');
                          return;
                        }
                        const response = await supabase
                          .from('orders')
                          .select('*')
                          .eq('id', order.id)
                          .single();
                        const data = response?.data;
                        if (data && data.payment_id) {
                          // Se já tem os dados, navega normalmente
                          navigate('/order-confirmation', {
                            state: {
                              orderId: order.id,
                              paymentId: data.payment_id,
                              pixCode: data.pix_code,
                              pixQrCode: data.pix_qr_code,
                              billetUrl: data.billet_url,
                              billetCode: data.billet_code,
                              paymentMethod: data.payment_method,
                              expiresAt: data.expires_at
                            }
                          });
                        } else {
                          // Se não tem dados de pagamento, gera um novo pagamento
                          // Buscar dados do pedido e itens
                          const { data: orderData } = await supabase
                            .from('orders')
                            .select('*')
                            .eq('id', order.id)
                            .single();
                          const { data: itemsData } = await supabase
                            .from('order_items')
                            .select('*')
                            .eq('order_id', order.id);
                          if (!orderData || !itemsData) {
                            alert('Não foi possível encontrar os dados do pedido para gerar o pagamento.');
                            return;
                          }
                          // Chama a API de pagamento (PIX, boleto, etc)
                          try {
                            const paymentPayload = {
                              amount: orderData.total_amount,
                              customerName: orderData.customer_name,
                              customerEmail: orderData.customer_email,
                              customerCpf: orderData.customer_cpf,
                              customerPhone: orderData.customer_phone,
                              orderId: orderData.id,
                              items: itemsData,
                              paymentMethod: orderData.payment_method || 'PIX',
                            };
                            // Importa a função dinamicamente para evitar problemas de import recursivo
                            const { createPayment } = await import('../lib/nivusPay');
                            const paymentResult = await createPayment(paymentPayload);
                            if (paymentResult.success) {
                              // Atualiza o pedido com os dados do pagamento
                              await supabase.from('orders').update({
                                payment_id: paymentResult.paymentId,
                                payment_method: orderData.payment_method || 'PIX',
                                pix_code: paymentResult.pixCode,
                                pix_qr_code: paymentResult.pixQrCode,
                                billet_url: paymentResult.billetUrl,
                                billet_code: paymentResult.billetCode,
                                expires_at: paymentResult.expiresAt
                              }).eq('id', order.id);
                              navigate('/order-confirmation', {
                                state: {
                                  orderId: order.id,
                                  paymentId: paymentResult.paymentId,
                                  pixCode: paymentResult.pixCode,
                                  pixQrCode: paymentResult.pixQrCode,
                                  billetUrl: paymentResult.billetUrl,
                                  billetCode: paymentResult.billetCode,
                                  paymentMethod: orderData.payment_method || 'PIX',
                                  expiresAt: paymentResult.expiresAt
                                }
                              });
                            } else {
                              alert('Erro ao gerar pagamento: ' + (paymentResult.error || 'Tente novamente.'));
                            }
                          } catch (err) {
                            alert('Erro ao gerar pagamento. Tente novamente.');
                          }
                        }
                      }}
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
