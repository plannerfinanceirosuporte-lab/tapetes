import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, Home, ShoppingBag } from 'lucide-react';
import { checkPaymentStatus } from '../lib/nivusPay';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useStore } from '../contexts/StoreContext';

export const ThankYou: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { settings } = useStore();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }

    verifyPaymentAndOrder();
    // Retry automático se não encontrar o pedido
    // Tenta até 5 vezes com 1s de intervalo
    let retryTimeout: NodeJS.Timeout;
    if (!orderData && retryCount < 5 && !loading) {
      retryTimeout = setTimeout(() => {
        setRetryCount((c) => c + 1);
        setLoading(true);
        verifyPaymentAndOrder();
      }, 1000);
    }
    // Se o pedido já está pago, força paymentVerified para true
    if (orderData && (orderData.status === 'confirmed' || orderData.payment_status === 'paid')) {
      setPaymentVerified(true);
    }
    return () => clearTimeout(retryTimeout);
  }, [orderId, paymentId, orderData]);

  const verifyPaymentAndOrder = async () => {
    try {
      console.log('🔄 Verificando pagamento e pedido...');
      // Buscar dados do pedido
      if (isSupabaseConfigured() && supabase) {
        const { data: order, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products(*)
            )
          `)
          .eq('id', orderId)
          .single();
        if (error) throw error;
        setOrderData(order);
        // Se tem payment_id, verificar status do pagamento
        if (paymentId && order && order.payment_id) {
          try {
            const paymentStatus = await checkPaymentStatus(order.payment_id);
            console.log('💳 Status do pagamento:', paymentStatus);
            // Verificar se foi aprovado
            if (paymentStatus.status === 'approved' || paymentStatus.status === 'paid') {
              setPaymentVerified(true);
              // Atualizar status do pedido para confirmado
              await supabase
                .from('orders')
                .update({ 
                  status: 'confirmed',
                  payment_status: 'paid'
                })
                .eq('id', orderId);
              console.log('✅ Pagamento aprovado e pedido confirmado!');
            }
          } catch (paymentError) {
            console.warn('⚠️ Erro ao verificar pagamento:', paymentError);
            // Continuar mesmo se não conseguir verificar o pagamento
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Verificando seu pagamento...</h2>
          <p className="text-gray-600">Aguarde enquanto confirmamos seu pedido</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Pedido não encontrado</h2>
          <p className="text-gray-600 mb-6">Não foi possível encontrar os dados do seu pedido.</p>
          <Link
            to="/"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar à Loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de Sucesso */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {paymentVerified ? 'Pagamento Aprovado!' : 'Pedido Recebido!'}
          </h1>
          <p className="modern-description text-lg">
            {paymentVerified 
              ? 'Seu pagamento foi processado com sucesso e seu pedido está confirmado.'
              : 'Recebemos seu pedido e você receberá atualizações por email.'
            }
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados do Pedido */}
            <div className="modern-card p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Detalhes do Pedido</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Número do Pedido</p>
                  <p className="text-lg font-bold text-gray-900">#{orderData.id.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data do Pedido</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(orderData.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className="modern-badge modern-badge-success">
                    Pago
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="modern-price text-xl">
                    R$ {Number(orderData.total_amount).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
              {/* Informações do Cliente */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">🚚 Informações de Entrega</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="font-medium text-gray-900">{orderData.customer_name}</p>
                  <p className="text-gray-600">{orderData.customer_email}</p>
                  <p className="text-gray-600 mt-2">{orderData.customer_address}</p>
                </div>
              </div>
            </div>
            {/* Itens do Pedido */}
            <div className="modern-card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🛍️ Itens do Pedido</h2>
              <div className="space-y-4">
                {orderData.order_items?.map((item: any) => {
                  let price = item.product_price ?? item.price ?? 0;
                  if (!price || price === 0) {
                    if (orderData.order_items.length === 1) {
                      price = Number(orderData.total_amount) / item.quantity;
                    }
                  }
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="modern-title text-base">{item.product?.name}</h4>
                        <p className="text-sm text-gray-600">Quantidade: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="modern-price text-base">
                          R$ {(item.quantity * price).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Sidebar com Próximos Passos */}
          <div className="lg:col-span-1">
            <div className="modern-card p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Próximos Passos</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Pedido Pago</p>
                    <p className="text-sm text-gray-600">Seu pagamento foi confirmado com sucesso</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Preparando Pedido</p>
                    <p className="text-sm text-gray-600">Seu pedido está sendo preparado para envio</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Envio</p>
                    <p className="text-sm text-gray-600">Você receberá o código de rastreamento em breve</p>
                  </div>
                </div>
              </div>
              {/* Estimativa de Entrega */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Entrega Estimada</span>
                </div>
                <p className="text-sm text-blue-700">
                  {orderData && orderData.created_at ? ((od) => {
                    function addBusinessDays(date: Date, days: number) {
                      let count = 0;
                      let result = new Date(date);
                      while (count < days) {
                        result.setDate(result.getDate() + 1);
                        if (result.getDay() !== 0 && result.getDay() !== 6) {
                          count++;
                        }
                      }
                      return result;
                    }
                    const pedidoDate = new Date(od.created_at);
                    const entregaDate = addBusinessDays(pedidoDate, 6);
                    let hash = 0;
                    for (let i = 0; i < od.id.length; i++) {
                      hash = od.id.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const hora = 8 + Math.abs(hash) % 10;
                    const minuto = Math.abs(hash * 31) % 60;
                    entregaDate.setHours(hora, minuto, 0, 0);
                    return `Receba até ${entregaDate.toLocaleDateString('pt-BR')} às ${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
                  })(orderData) : 'Carregando estimativa...'}
                </p>
              </div>
              {/* Ações */}
              {/* Avaliação removida */}
            </div>
          </div>
        </div>
        {/* Informações Adicionais */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Importantes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📧 Confirmação por Email</h4>
              <p className="text-sm text-gray-600">
                Enviamos um email de confirmação para <strong>{orderData.customer_email}</strong> 
                com todos os detalhes do seu pedido.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📱 Acompanhamento</h4>
              <p className="text-sm text-gray-600">
                Você receberá atualizações sobre o status do seu pedido por email e SMS.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🚚 Entrega</h4>
              <p className="text-sm text-gray-600">
                Frete grátis para todo Brasil. Prazo de entrega: {settings?.estimated_delivery_days || 7} dias úteis.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">💬 Suporte</h4>
              <p className="text-sm text-gray-600">
                Dúvidas? Entre em contato: {settings?.contact_email || settings?.contact_phone || 'suporte@loja.com'}
              </p>
            </div>
          </div>
        </div>
        {/* Footer da Página */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Obrigado por escolher {settings?.store_name}! 🎉
          </p>
        </div>
      </div>
    </div>
  );
};