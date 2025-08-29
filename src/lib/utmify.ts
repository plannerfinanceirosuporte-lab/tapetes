import axios from 'axios';

const UTMIFY_API_TOKEN = import.meta.env.UTMIFY_API_TOKEN || 'U4c6cF4A3LvwwsEabTmIoTI4mQKQ0G4xNkvS';

// 🔄 Mapeia status interno para status UTMify
const mapStatusToUtmify = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'waiting_payment';
    case 'confirmed':
      return 'paid';
    case 'cancelled':
      return 'refused';
    case 'shipped':
      return 'shipped';
    case 'delivered':
      return 'delivered';
    default:
      return 'waiting_payment';
  }
};

export interface UtmifyProduct {
  id: string;
  name: string;
  planId?: string | null;
  planName?: string | null;
  quantity: number;
  priceInCents: number;
}

export interface UtmifyCustomer {
  name: string;
  email: string;
  phone: string;
  document: string;
}

export interface UtmifyTrackingParams {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

export interface UtmifyOrderUpdateData {
  orderId: string;
  status: string;
  customer: UtmifyCustomer;
  products: UtmifyProduct[];
  trackingParameters?: UtmifyTrackingParams;
}

// Atualiza status do pedido na UTMify
export const updateUtmifyOrderStatus = async (data: UtmifyOrderUpdateData) => {
  try {
    await axios.post(
      'https://api.utmify.com.br/api-credentials/orders',
      {
        orderId: data.orderId,
        platform: 'MinhaLojaCustomReact',
        paymentMethod: 'custom',
        status: mapStatusToUtmify(data.status),
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        approvedDate: data.status.toLowerCase() === 'confirmed'
          ? new Date().toISOString().slice(0, 19).replace('T', ' ')
          : null,
        refundedAt: null,
        customer: data.customer,
        products: data.products,
        trackingParameters: data.trackingParameters || {},
        commission: {
          totalPriceInCents: data.products.reduce((acc, p) => acc + p.priceInCents * p.quantity, 0),
          gatewayFeeInCents: 0,
          userCommissionInCents: data.products.reduce((acc, p) => acc + p.priceInCents * p.quantity, 0)
        },
        isTest: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': UTMIFY_API_TOKEN
        }
      }
    );
    console.log(`📊 Pedido ${data.orderId} atualizado na UTMify com sucesso!`);
  } catch (err: any) {
    console.error(`❌ Erro ao atualizar pedido ${data.orderId} na UTMify:`, err.response?.data || err.message);
  }
};
