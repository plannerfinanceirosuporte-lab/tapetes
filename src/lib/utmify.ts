import axios from 'axios';

const UTMIFY_API_TOKEN = import.meta.env.UTMIFY_API_TOKEN || 'U4c6cF4A3LvwwsEabTmIoTI4mQKQ0G4xNkvS';

// 🔄 Mapeamento de status do painel → status UTMify
const mapStatusToUtmify = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'waiting_payment';
    case 'confirmed':
      return 'paid';
    case 'cancelled':
      return 'refused';
    default:
      return 'waiting_payment';
  }
};

// 🔄 Mapeamento de status para o método de pagamento padrão
const mapPaymentMethod = (status: string): 'pix' | 'credit_card' | 'billet' => {
  switch (status) {
    case 'confirmed':
      return 'pix'; // ou 'credit_card' dependendo da sua lógica
    case 'pending':
      return 'pix';
    case 'cancelled':
      return 'pix';
    default:
      return 'pix';
  }
};

// Função para atualizar status de pedido na UTMify
export const updateUtmifyOrderStatus = async (
  orderId: string,
  status: string,
  customer?: { name: string; email: string; phone: string; document: string },
  items?: { id: string; name: string; quantity: number; priceInCents: number }[],
  totalAmountInCents?: number
) => {
  try {
    // Campos obrigatórios para UTMify
    const payload: any = {
      orderId,
      platform: 'MinhaLojaCustomReact',
      paymentMethod: mapPaymentMethod(status),
      status: mapStatusToUtmify(status),
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      approvedDate: status === 'confirmed' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null,
      refundedAt: null,
      customer: {
        name: customer?.name || 'Cliente',
        email: customer?.email || 'email@exemplo.com',
        phone: customer?.phone || '00000000000',
        document: customer?.document || '00000000000'
      },
      products: items?.map(item => ({
        id: item.id,
        name: item.name,
        planId: null,
        planName: null,
        quantity: item.quantity,
        priceInCents: item.priceInCents
      })) || [],
      commission: {
        totalPriceInCents: totalAmountInCents || 0,
        gatewayFeeInCents: 0,
        userCommissionInCents: totalAmountInCents || 0
      },
      trackingParameters: {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null
      },
      isTest: false
    };

    const response = await axios.post('https://api.utmify.com.br/api-credentials/orders', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': UTMIFY_API_TOKEN
      }
    });

    if (response.data?.result !== 'OK') {
      console.error(`❌ Erro ao atualizar pedido ${orderId} na UTMify:`, response.data);
    } else {
      console.log(`✅ Pedido ${orderId} atualizado na UTMify com status "${status}"`);
    }
    return response.data;
  } catch (error: any) {
    console.error(`❌ Erro ao atualizar pedido ${orderId} na UTMify:`, error.response?.data || error.message);
    throw error;
  }
};
