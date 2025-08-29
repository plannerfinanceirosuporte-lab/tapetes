import axios from 'axios';

const API_BASE_URL = 'https://pay.nivuspay.com.br/api/v1';
const SECRET_KEY = import.meta.env.NIVUS_PAY_SECRET_KEY || 'ba4559db-f9e1-49c3-824b-55c0f2f49791';
const PUBLIC_KEY = import.meta.env.VITE_NIVUS_PAY_PUBLIC_KEY || '143c6730-2b82-41bb-9866-bc627f955b83';
const UTMIFY_API_TOKEN = import.meta.env.UTMIFY_API_TOKEN || 'U4c6cF4A3LvwwsEabTmIoTI4mQKQ0G4xNkvS';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentData {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  customerPhone: string;
  orderId: string;
  items: CartItem[];
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'BILLET';
  creditCardToken?: string;
  installments?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  qrCode?: string;
  pixCode?: string;
  pixQrCode?: string;
  billetUrl?: string;
  billetCode?: string;
  paymentId?: string;
  transactionId?: string;
  status?: string;
  expiresAt?: string;
  error?: string;
}

export interface CardTokenData {
  cardNumber: string;
  cardCvv: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  holderName: string;
  holderDocument: string;
}

export interface CardTokenResponse {
  success: boolean;
  token?: string;
  error?: string;
}

// Função para criar token do cartão
export const createCardToken = async (cardData: CardTokenData): Promise<CardTokenResponse> => {
  try {
    console.log('🔄 Criando token do cartão...');
    
    const payload = {
      cardNumber: cardData.cardNumber.replace(/\s/g, ''), 
      cardCvv: cardData.cardCvv,
      cardExpirationMonth: cardData.cardExpirationMonth.padStart(2, '0'),
      cardExpirationYear: cardData.cardExpirationYear.slice(-2),
      holderName: cardData.holderName,
      holderDocument: cardData.holderDocument.replace(/\D/g, '')
    };

    console.log('📤 Payload para token:', { ...payload, cardNumber: '****', cardCvv: '***' });

    const response = await axios.post(`${API_BASE_URL}/transaction.createCardToken`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SECRET_KEY,
      },
      timeout: 30000,
    });

    console.log('✅ Token criado com sucesso');
    
    return {
      success: true,
      token: response.data.token,
    };
  } catch (error: any) {
    console.error('❌ Erro ao criar token do cartão:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao processar dados do cartão',
    };
  }
};

// Função principal para criar pagamento
export const createPayment = async (paymentData: PaymentData): Promise<PaymentResponse> => {
  try {
    console.log('🔄 Iniciando pagamento com Nivus Pay');
    
    const amountInCents = Math.round(parseFloat(paymentData.amount.toString().replace(',', '.')) * 100);
    if (amountInCents < 501) {
      return { success: false, error: 'Valor mínimo para pagamento é R$ 5,01' };
    }

    const cleanCpf = paymentData.customerCpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      return { success: false, error: 'CPF deve ter 11 dígitos' };
    }

    const cleanPhone = paymentData.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return { success: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
    }

    const items = paymentData.items.map(item => ({
      unitPrice: Math.round(parseFloat(item.price.toString().replace(',', '.')) * 100),
      title: item.name,
      quantity: item.quantity,
      tangible: false
    }));

    const basePayload = {
      name: paymentData.customerName,
      email: paymentData.customerEmail,
      cpf: cleanCpf,
      phone: cleanPhone,
      paymentMethod: paymentData.paymentMethod || 'PIX',
      amount: amountInCents,
      traceable: true,
      items: items,
      externalId: paymentData.orderId,
      postbackUrl: `${window.location.origin}/payment-callback?orderId=${paymentData.orderId}`,
      utmQuery: `utm_source=${paymentData.utm_source || ''}&utm_medium=${paymentData.utm_medium || ''}&utm_campaign=${paymentData.utm_campaign || ''}`
    };

    let payload = basePayload;
    if (paymentData.paymentMethod === 'CREDIT_CARD' && paymentData.creditCardToken) {
      payload = {
        ...basePayload,
        creditCard: {
          token: paymentData.creditCardToken,
          installments: paymentData.installments || 1
        }
      };
    }

    const response = await axios.post(`${API_BASE_URL}/transaction.purchase`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SECRET_KEY,
      },
      timeout: 30000,
    });

    const responseData = response.data;

    if (!responseData.id) {
      return { success: false, error: 'Resposta inválida da API de pagamento' };
    }

    console.log('✅ Pagamento criado com sucesso!');

    // 🔗 Enviar dados para UTMify
    try {
      await axios.post(
        'https://api.utmify.com.br/api-credentials/orders',
        {
          orderId: paymentData.orderId,
          platform: 'MinhaLojaCustomReact',
          paymentMethod: (paymentData.paymentMethod || 'PIX').toLowerCase(),
          status: responseData.status?.toLowerCase() || 'waiting_payment',
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
          approvedDate: responseData.status === 'PAID'
            ? new Date().toISOString().slice(0, 19).replace('T', ' ')
            : null,
          refundedAt: null,
          customer: {
            name: paymentData.customerName,
            email: paymentData.customerEmail,
            phone: cleanPhone,
            document: cleanCpf
          },
          products: paymentData.items.map(item => ({
            id: item.id,
            name: item.name,
            planId: null,
            planName: null,
            quantity: item.quantity,
            priceInCents: Math.round(item.price * 100)
          })),
          trackingParameters: {
            utm_source: paymentData.utm_source || null,
            utm_medium: paymentData.utm_medium || null,
            utm_campaign: paymentData.utm_campaign || null,
            utm_content: paymentData.utm_content || null,
            utm_term: paymentData.utm_term || null
          },
          commission: {
            totalPriceInCents: amountInCents,
            gatewayFeeInCents: 0,
            userCommissionInCents: amountInCents
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
      console.log('📊 Venda registrada na UTMify com sucesso!');
    } catch (utmError: any) {
      console.error('❌ Erro ao enviar venda para UTMify:', utmError.response?.data || utmError.message);
    }

    return {
      success: true,
      paymentId: responseData.id,
      transactionId: responseData.customId,
      status: responseData.status,
      expiresAt: responseData.expiresAt,
      pixCode: responseData.pixCode,
      pixQrCode: responseData.pixQrCode,
      billetUrl: responseData.billetUrl,
      billetCode: responseData.billetCode,
    };
  } catch (error: any) {
    console.error('❌ Erro detalhado ao criar pagamento Nivus Pay:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
    
    let errorMessage = 'Erro ao processar pagamento';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.issues && error.response.data.issues.length > 0) {
      errorMessage = error.response.data.issues.map((issue: any) => issue.message).join(', ');
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};

// Função para verificar status do pagamento
export const checkPaymentStatus = async (paymentId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/transaction.getPayment`, {
      params: { id: paymentId },
      headers: { 'Authorization': SECRET_KEY },
      timeout: 30000,
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao verificar status do pagamento:', error.response?.data || error.message);
    throw error;
  }
};

// Função auxiliar para validar CPF
export const validateCPF = (cpf: string): boolean => {
  const cleanCpf = cpf.replace(/\D/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) return false;
  
  return true;
};

// Função auxiliar para formatar CPF
export const formatCPF = (cpf: string): string => {
  const cleanCpf = cpf.replace(/\D/g, '');
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Função auxiliar para formatar telefone
export const formatPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};
