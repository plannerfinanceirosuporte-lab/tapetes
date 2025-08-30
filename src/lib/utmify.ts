import axios from 'axios';

const UTMIFY_API_TOKEN = import.meta.env.UTMIFY_API_TOKEN || 'U4c6cF4A3LvwwsEabTmIoTI4mQKQ0G4xNkvS';

const mapStatusToUtmify = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'waiting_payment';
    case 'confirmed':
      return 'paid';
    case 'cancelled':
      return 'refused';
    case 'delivered':
      return 'delivered';
    default:
      return 'waiting_payment';
  }
};

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  document: string;
}

export interface UtmifyProduct {
  id: string;
  name: string;
  planId?: string | null;
  planName?: string | null;
  quantity: number;
  priceInCents: number;
}

export const updateUtmifyOrderStatus = async (
  orderId: string,
  status: string,
  customer: CustomerData,
  products: UtmifyProduct[],
  totalAmountInCents: number,
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'BILLET' = 'PIX'
) => {
  try {
    const payload = {
      orderId,
      platform: 'MinhaLojaCustomReact',
      paymentMethod: paymentMethod.toLowerCase(),
      status: mapStatusToUtmify(status),
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      approvedDate: status.toLowerCase() === 'confirmed'
        ? new Date().toISOString().slice(0, 19).replace('T', ' ')
        : null,
      refundedAt: null,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document
      },
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        planId: p.planId || null,
        planName: p.planName || null,
        quantity: p.quantity,
        priceInCents: p.priceInCents
      })),
      trackingParameters: {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null
      },
      commission: {
        totalPriceInCents: totalAmountInCents,
        gatewayFeeInCents: 0,
        userCommissionInCents: totalAmountInCents
      },
      isTest: false
    };

    const response = await axios.post(
      'https://api.utmify.com.br/api-credentials/orders',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': UTMIFY_API_TOKEN
        }
      }
    );

    console.log('📊 Pedido atualizado na UTMify com sucesso:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Erro ao atualizar pedido ${orderId} na UTMify:`, error.response?.data || error.message);
    throw error;
  }
};
