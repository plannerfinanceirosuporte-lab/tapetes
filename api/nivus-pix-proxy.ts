import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://pay.nivuspay.com.br/api/v1/transaction.purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.NIVUS_PAY_SECRET_KEY || req.headers['authorization'] || '',
      },
      body: JSON.stringify(req.body),
    });
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    if (!response.ok) {
      console.error('NivusPay error:', response.status, data);
      return res.status(response.status).json({ error: data, status: response.status });
    }
    res.status(response.status).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
