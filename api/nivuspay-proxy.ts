import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await axios.post(
      'https://pay.nivuspay.com.br/api/v1/transaction.purchase',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers['authorization'] ? { 'Authorization': req.headers['authorization'] } : {})
        },
        timeout: 15000
      }
    );
    res.status(response.status).json(response.data);
  } catch (error: any) {
    // Log detalhado para debug
    console.error('Erro no proxy NivusPay:', {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      stack: error.stack
    });
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message || 'Erro desconhecido no proxy NivusPay',
      debug: {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        stack: error.stack,
        payload: req.body
      }
    });
  }
}
