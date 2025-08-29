import axios from 'axios';

const UTMIFY_API_TOKEN = process.env.UTMIFY_API_TOKEN || 'U4c6cF4A3LvwwsEabTmIoTI4mQKQ0G4xNkvS';

/**
 * Atualiza o status do pedido na UTMify
 * @param orderId string
 * @param status 'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback' | 'cancelled'
 */
export const updateUtmifyOrderStatus = async (orderId: string, status: string) => {
  try {
    await axios.patch(
      'https://api.utmify.com.br/api-credentials/orders',
      { orderId, status },
      { headers: { 'Content-Type': 'application/json', 'x-api-token': UTMIFY_API_TOKEN } }
    );
    return true;
  } catch (error: any) {
    console.error('Erro ao atualizar status na UTMify:', error.response?.data || error.message);
    return false;
  }
};
