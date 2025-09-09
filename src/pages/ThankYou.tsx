import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Info, Mail, Smartphone, MessageCircle } from 'lucide-react';
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

    // Tenta até 5 vezes com 1s de intervalo, caso o pedido não seja encontrado
    let retryTimeout: NodeJS.Timeout;
    if (!orderData && retryCount < 5 && !loading) {
      retryTimeout = setTimeout(() => {
        setRetryCount((c) => c + 1);
        setLoading(true);
        verifyPaymentAndOrder();
      }, 1000);
    }

    // Se o pedido já está pago, forçar paymentVerified para true
    if (orderData && (orderData.status === 'confirmed' || orderData.payment_status === 'paid')) {
      setPaymentVerified(true);
    }

    // Adicionar evento do Facebook Pixel para "Purchase"
    if (orderData && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: orderData.total_amount, // Valor total da compra
        currency: 'BRL' // Moeda brasileira
      });
    }

    return () => clearTimeout(retryTimeout);
  }, [orderId, paymentId, orderData]);

  const verifyPaymentAndOrder = async () => {
    try {
      console.log('🔄 Verificando pagamento e pedido...');
      if (isSupabaseConfigured() && supabase) {
        const { data: order, error } = await supabase
          .from('orders')
          .select(`*, order_items (*, product:products(*))`)
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrderData(order);

        if (paymentId && order && order.payment_id) {
          try {
            const paymentStatus = await checkPaymentStatus(order.payment_id);
            console.log('💳 Status do pagamento:', paymentStatus);
            if (paymentStatus.status === 'approved' || paymentStatus.status === 'paid') {
              setPaymentVerified(true);
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
      {/* Aqui você mantém o conteúdo de sucesso da compra */}
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
              : 'Recebemos seu pedido e você receberá atualizações por email.'}
          </p>
        </div>
      </div>
    </div>
  );
};
