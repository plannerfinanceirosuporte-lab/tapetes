// src/lib/fbPixel.ts

// Declaração global para o fbq do Meta Pixel
declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}
// Utilitário para disparo seguro de eventos do Meta Pixel no React/TypeScript

export type FbPixelEvent =
  | 'PageView'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase';

export interface FbPixelEventParams {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?: number;
  [key: string]: any;
}

function isPixelAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

export function fbPixelEvent(event: FbPixelEvent, params?: FbPixelEventParams) {
  if (!isPixelAvailable() || !window.fbq) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[Meta Pixel] fbq not available:', event, params);
    }
    return;
  }
  window.fbq('track', event, params || {});
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[Meta Pixel] Event sent:', event, params);
  }
}

// Helper para pageview
export function fbPageView() {
  fbPixelEvent('PageView');
}
