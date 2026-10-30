import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { trackPaymentFailed, trackPurchase } from '../utils/fbPixel';
import RecommendationSection from '../components/RecommendationSection';

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${orderId}`);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order || !orderId || !(order.paymentStatus === 'paid' || (order.paymentMethod === 'cod' && order.paymentStatus === 'pending'))) return;

    const storageKey = `fb-pixel-purchase:${orderId}`;
    if (localStorage.getItem(storageKey)) return;

    const contentIds = Array.isArray(order.items)
      ? order.items.map((item: { productId?: string }) => item.productId).filter(Boolean)
      : [];
    trackPurchase(orderId, Number(order.total || 0), contentIds);
    localStorage.setItem(storageKey, 'true');
  }, [order, orderId]);

  useEffect(() => {
    if (!order || !orderId || order.paymentStatus !== 'failed') return;

    const storageKey = `fb-pixel-payment-failed:${orderId}`;
    if (localStorage.getItem(storageKey)) return;

    trackPaymentFailed(orderId, Number(order.total || 0), order.paymentMethod || 'unknown');
    localStorage.setItem(storageKey, 'true');
  }, [order, orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
          <h2 className="text-3xl font-serif font-bold mb-4">Order Not Found</h2>
          <a href="/" className="btn-primary inline-block">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.total || 0) - Number(order.tax || 0) - Number(order.shipping || 0);
  const customer = order.customer || {};
  const paymentMethodLabels: Record<string, string> = {
    cod: 'Cash on Delivery',
    esewa: 'eSewa',
    khalti: 'Khalti',
    mobile_banking: 'Mobile Banking',
    card: 'Credit/Debit Card',
  };
  const isPaymentFailed = order.paymentStatus === 'failed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        {isPaymentFailed ? (
          <AlertCircle size={64} className="mx-auto text-red-600 mb-4" />
        ) : (
          <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
        )}
        <h1 className="text-4xl font-serif font-bold mb-2">{isPaymentFailed ? 'Payment Failed' : 'Order Confirmed'}</h1>
        <p className="text-gray-600 text-lg">
          {isPaymentFailed ? 'Your cart is safe. Retry payment or choose another method to complete your order.' : 'Thank you for your purchase. Your order has been received.'}
        </p>
      </div>

      <div className="card p-8 mb-8">
        <h2 className="text-2xl font-serif font-bold mb-6">Order Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
          <div>
            <p className="text-gray-600 text-sm font-semibold">Order Number</p>
            <p className="text-lg font-bold">{order.orderNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Order Date</p>
            <p className="text-lg font-bold">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Status</p>
            <p className="text-lg font-bold capitalize text-primary">{order.status || 'pending'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Payment Method</p>
            <p className="text-lg font-bold">{paymentMethodLabels[order.paymentMethod] || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm font-semibold">Payment Status</p>
            <p className="text-lg font-bold capitalize text-primary">{order.paymentStatus || 'pending'}</p>
          </div>
          {order.bankName && (
            <div>
              <p className="text-gray-600 text-sm font-semibold">Bank</p>
              <p className="text-lg font-bold">{order.bankName}</p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h3 className="font-serif font-bold text-lg mb-4">Items Ordered</h3>
          <div className="space-y-3">
            {items.length > 0 ? (
              items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm border-b pb-2 gap-4">
                  <span className="flex-1">{item.productId || 'Product'} x {item.quantity || 0}</span>
                  <span>Rs. {Number(item.price || 0).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No items found for this order.</p>
            )}
          </div>
        </div>

        <div className="mb-8 pb-8 border-b">
          <h3 className="font-serif font-bold text-lg mb-4">Shipping Address</h3>
          <p className="text-gray-700">
            {customer.firstName || ''} {customer.lastName || ''}<br />
            {customer.address || ''}<br />
            {customer.city || ''}{customer.city && customer.state ? ', ' : ''}{customer.state || ''} {customer.zipCode || ''}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>Rs. {Number(order.tax || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Rs. {Number(order.shipping || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total</span>
            <span className="text-primary">Rs. {Number(order.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {isPaymentFailed && (
        <div className="card p-6 mb-8 border border-red-200 bg-red-50">
          <h3 className="font-serif font-bold text-lg mb-2 text-red-800">Payment wasn&apos;t completed</h3>
          <p className="text-red-700 mb-4">No payment was taken. Your items remain in the cart so you can try again.</p>
          <a href="/checkout" className="btn-primary inline-block">Retry or choose another method</a>
        </div>
      )}

      <div className="card p-6 mb-8">
        <h3 className="font-serif font-bold text-lg mb-4">What&apos;s Next?</h3>
        <ul className="space-y-3 text-gray-700">
          <li className="flex gap-3">
            <span className="text-primary font-bold">1.</span>
            <span>A confirmation email has been sent to {customer.email || 'your email address'}</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">2.</span>
            <span>Your order will be processed and shipped within 2-3 business days.</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">3.</span>
            <span>You&apos;ll receive tracking information via email.</span>
          </li>
        </ul>
      </div>

      <div className="flex gap-4 justify-center">
        <a href="/" className="btn-primary">
          Back to Home
        </a>
        <a href="/products" className="btn-outline">
          Continue Shopping
        </a>
      </div>
      <RecommendationSection
        title="Recommended for you"
        endpoint={`/api/recommendations/user?email=${encodeURIComponent(customer.email || '')}`}
      />
    </div>
  );
}
