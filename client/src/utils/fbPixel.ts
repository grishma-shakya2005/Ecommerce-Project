const pixelId = import.meta.env.VITE_FB_PIXEL_ID as string | undefined;
const debugEnabled = import.meta.env.VITE_PIXEL_DEBUG === 'true';

type PixelParams = Record<string, string | number | string[] | undefined>;
type Fbq = ((command: 'init' | 'track' | 'trackCustom', event: string, params?: PixelParams) => void) & {
  queue: unknown[][];
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const logEvent = (event: string, params?: PixelParams) => {
  if (debugEnabled) {
    console.info(`[Facebook Pixel] ${event}`, params || {});
  }
};

export const initPixel = () => {
  if (typeof window === 'undefined' || !pixelId || window.fbq) return;

  const fbq: Fbq = (...args) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  window.fbq = fbq;
  window._fbq = fbq;

  fbq('init', pixelId);

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);
};

export const initializeFacebookPixel = initPixel;

const track = (event: string, params?: PixelParams) => {
  logEvent(event, params);
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, params);
  }
};

const trackCustom = (event: string, params?: PixelParams) => {
  logEvent(event, params);
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', event, params);
  }
};

export const trackPageView = () => track('PageView');

export const trackViewContent = (product: { _id: string; name: string; price: number }) =>
  track('ViewContent', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'NPR',
  });

export const trackAddToCart = (item: { _id: string; name: string; price: number; quantity: number }) =>
  track('AddToCart', {
    content_ids: [item._id],
    content_name: item.name,
    content_type: 'product',
    value: item.price * item.quantity,
    currency: 'NPR',
    quantity: item.quantity,
  });

export const trackInitiateCheckout = (value: number, numItems: number) =>
  track('InitiateCheckout', {
    value,
    num_items: numItems,
    currency: 'NPR',
  });

export const trackPurchase = (orderId: string, value: number, contentIds: string[]) =>
  track('Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    order_id: orderId,
    value,
    currency: 'NPR',
  });

export const trackPaymentFailed = (orderId: string, value: number, paymentMethod: string) =>
  track('PaymentFailed', {
    order_id: orderId,
    value,
    payment_method: paymentMethod,
    currency: 'NPR',
  });

export const trackProductImpression = (product: { _id: string; name: string; price: number }) =>
  trackCustom('ProductImpression', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'NPR',
  });

export const trackProductClick = (product: { _id: string; name: string; price: number }) =>
  trackCustom('ProductClick', {
    content_ids: [product._id],
    content_name: product.name,
    content_type: 'product',
    value: product.price,
    currency: 'NPR',
  });
