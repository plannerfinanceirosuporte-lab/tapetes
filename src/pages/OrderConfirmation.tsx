import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { checkPaymentStatus } from '../lib/nivusPay';
import { CheckCircle, Home, ShoppingBag, Clock, FileText, QrCode } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Pega do state (preferencial), senão da URL
  const [orderData, setOrderData] = useState<any>(null);
  const orderId = location.state?.orderId || searchParams.get('orderId');
  let paymentId = location.state?.paymentId || searchParams.get('paymentId');
  let pixCode = location.state?.pixCode;
  let pixQrCode = location.state?.pixQrCode;
  let billetUrl = location.state?.billetUrl;
  let billetCode = location.state?.billetCode;
  let paymentMethod = location.state?.paymentMethod;
  let expiresAt = location.state?.expiresAt;

  // Busca dados do pedido se não vieram no state
  useEffect(() => {
    if ((!pixCode && !pixQrCode && !billetUrl && !paymentId) && orderId && supabase) {
      supabase.from('orders').select('*').eq('id', orderId).single().then(({ data }) => {
        if (data) setOrderData(data);
      });
    }
  }, [orderId]);

  if (orderData) {
    paymentId = paymentId || orderData.payment_id;
    pixCode = pixCode || orderData.pix_code;
    pixQrCode = pixQrCode || orderData.pix_qr_code;
    billetUrl = billetUrl || orderData.billet_url;
    billetCode = billetCode || orderData.billet_code;
    paymentMethod = paymentMethod || orderData.payment_method;
    expiresAt = expiresAt || orderData.expires_at;
  }

  // Novo: status do pedido
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed'>(searchParams.get('verified') === 'true' ? 'confirmed' : 'pending');

  // Itens e total do pedido
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [orderTotal, setOrderTotal] = useState<number>(0);

  // Verificação automática de pagamento
  useEffect(() => {
    let isMounted = true;
    if (!orderId || !paymentId) return;
    const checkStatus = async () => {
      let status = null;
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.from('orders').select('status').eq('id', orderId).single();
        if (!error && data) status = data.status;
      }
      if (status === 'confirmed') {
        if (isMounted) setOrderStatus('confirmed');
      }
      // 2. Se não estiver pago, verifica na Nivus
      if (status !== 'confirmed' && paymentId) {
        try {
          const payment = await checkPaymentStatus(paymentId);
          if (payment.status === 'APPROVED' || payment.status === 'PAID') {
            // Atualiza pedido no Supabase
            if (isSupabaseConfigured()) {
              await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);
            }
            status = 'confirmed';
            if (isMounted) setOrderStatus('confirmed');
          }
        } catch (e) { /* ignora erro */ }
      }
      // 3. Se pago, redireciona
      if (isMounted && status === 'confirmed') {
        window.scrollTo({ top: 0, behavior: 'auto' });
        navigate(`/thank-you?orderId=${orderId}&paymentId=${paymentId}&verified=true`);
      }
    };
    intervalRef.current = setInterval(checkStatus, 5000);
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId, paymentId, navigate]);

  // Buscar itens e total do pedido
  useEffect(() => {
    const fetchOrderItems = async () => {
      if (!orderId || !isSupabaseConfigured()) return;
      const { data, error } = await supabase
        .from('order_items')
        .select('*, product:products(*)')
        .eq('order_id', orderId);
      if (!error && data) {
        setOrderItems(data);
        const total = data.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setOrderTotal(total);
      }
    };
    fetchOrderItems();
  }, [orderId]);

  console.log('📄 Página de confirmação carregada');
  console.log('📊 Dados recebidos:', { 
    orderId, 
    pixCode: !!pixCode, 
    pixQrCode: !!pixQrCode, 
    billetUrl: !!billetUrl,
    paymentMethod,
    paymentId 
  });

  // Se não há dados de pagamento, mostra mensagem amigável
  if (!orderId || (!pixCode && !pixQrCode && !billetUrl && !paymentId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Não foi possível encontrar os dados de pagamento
          </h1>
          <p className="text-gray-600 mb-6">
            Tente gerar o pagamento novamente.<br />Se o problema persistir, entre em contato com o suporte.
          </p>
          <Link
            to="/"
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </div>
    );
  }

  const getPaymentMethodInfo = () => {
    switch (paymentMethod) {
      case 'PIX':
        return {
          title: 'Pagamento via PIX',
          description: 'Complete o pagamento via PIX para confirmar seu pedido.',
          icon: QrCode,
          color: 'text-blue-600'
        };
      case 'CREDIT_CARD':
        return {
          title: 'Pagamento com Cartão',
          description: 'Seu pagamento está sendo processado.',
          icon: CheckCircle,
          color: 'text-green-600'
        };
      case 'BILLET':
        return {
          title: 'Boleto Bancário',
          description: 'Pague o boleto até o vencimento para confirmar seu pedido.',
          icon: FileText,
          color: 'text-orange-600'
        };
      default:
        return {
          title: 'Pedido Confirmado',
          description: 'Você receberá um email de confirmação em breve.',
          icon: CheckCircle,
          color: 'text-green-600'
        };
    }
  };

  const paymentInfo = getPaymentMethodInfo();
  const PaymentIcon = paymentInfo.icon;
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
  {/* Próximos Passos removido */}
  {/* Itens do Pedido removido */}
        <PaymentIcon className={`h-16 w-16 ${paymentInfo.color} mx-auto mb-4`} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {paymentInfo.title}
        </h1>
        <p className="text-gray-600 mb-6">
          {paymentInfo.description}
        </p>
        {orderId && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Número do Pedido:</p>
            <p className="text-lg font-bold text-gray-900" id="order-number">#{orderId.slice(-8)}</p>
          </div>
        )}
        {/* Mostrar dados do PIX se disponível */}
        {pixCode && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Pagamento via PIX</h3>
            {pixQrCode && (
              <div className="mb-4">
                <img src={pixQrCode} alt="QR Code PIX" className="mx-auto max-w-48" />
                <p className="text-sm text-blue-700 mt-2">Escaneie o QR Code com seu app do banco</p>
              </div>
            )}
            <div className="bg-white rounded p-3 mb-2">
              <p className="text-xs text-gray-600">Código PIX:</p>
              <p className="text-sm font-mono break-all">{pixCode}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(pixCode)}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              Copiar código PIX
            </button>
            {expiresAt && (
              <div className="mt-3 flex items-center justify-center space-x-1 text-sm text-blue-700">
                <Clock className="h-4 w-4" />
                <span>Expira em: {new Date(expiresAt).toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}
        {/* Mostrar dados do Boleto se disponível */}
        {billetUrl && (
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">Boleto Bancário</h3>
            <p className="text-sm text-orange-700 mb-3">
              Clique no botão abaixo para visualizar e imprimir seu boleto
            </p>
            {billetCode && (
              <div className="bg-white rounded p-3 mb-3">
                <p className="text-xs text-gray-600">Código do Boleto:</p>
                <p className="text-sm font-mono">{billetCode}</p>
              </div>
            )}
            <a
              href={billetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Visualizar Boleto</span>
            </a>
            {expiresAt && (
              <div className="mt-3 flex items-center justify-center space-x-1 text-sm text-orange-700">
                <Clock className="h-4 w-4" />
                <span>Vencimento: {new Date(expiresAt).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}
        {/* Informações para Cartão de Crédito */}
        {paymentMethod === 'CREDIT_CARD' && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Pagamento Processado</h3>
            <p className="text-sm text-green-700">
              Seu pagamento com cartão de crédito foi processado com sucesso. 
              Você receberá a confirmação por email em alguns minutos.
            </p>
          </div>
        )}
        <div className="space-y-3">
          <div className="mb-4">
            <span className="text-lg font-bold text-gray-900" id="order-total">
              R$ {orderTotal.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <Link
            to="/"
            className="w-full bg-gray-200 text-gray-900 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Continuar Comprando</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
