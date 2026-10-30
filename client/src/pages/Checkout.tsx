import { useForm } from 'react-hook-form';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { trackInitiateCheckout } from '../utils/fbPixel';
import Seo from '../components/Seo';
import { Banknote, CreditCard, Smartphone } from 'lucide-react';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'cod' | 'esewa' | 'khalti' | 'mobile_banking' | 'card';
  bankName: string;
  cardHolderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  gatewayMobile: string;
}

const banks = [
  { name: 'Nabil Bank', logo: 'nabil.png', color: '#0b4f9c' },
  { name: 'NIC Asia', logo: 'nic-asia.png', color: '#e31837' },
  { name: 'Global IME Bank', logo: 'global-ime.png', color: '#f58220' },
  { name: 'Nepal Investment Mega Bank', logo: 'nepal-investment-mega.png', color: '#005baa' },
  { name: 'Siddhartha Bank', logo: 'siddhartha.png', color: '#ed1c24' },
  { name: 'Himalayan Bank', logo: 'himalayan.png', color: '#0066a1' },
  { name: 'Prabhu Bank', logo: 'prabhu.png', color: '#e21e2b' },
  { name: 'Sanima Bank', logo: 'sanima.png', color: '#005baa' },
  { name: 'Kumari Bank', logo: 'kumari.png', color: '#d71920' },
  { name: 'Laxmi Sunrise Bank', logo: 'laxmi-sunrise.png', color: '#e30613' },
  { name: 'Machhapuchchhre Bank', logo: 'machhapuchchhre.png', color: '#005baa' },
  { name: 'Rastriya Banijya Bank', logo: 'rastriya-banijya.png', color: '#004b93' },
] as const;

export default function Checkout() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: { paymentMethod: 'cod', bankName: '' },
  });
  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'checkout' | 'gateway'>('checkout');
  const [gatewayStep, setGatewayStep] = useState<'login' | 'confirm'>('login');
  const gatewayMobileRef = useRef<HTMLInputElement>(null);
  const gatewayPinRef = useRef<HTMLInputElement>(null);
  const paymentMethod = watch('paymentMethod');

  const total = getTotalPrice();
  const tax = total * 0.1;
  const shipping = items.length > 0 ? 10 : 0;
  const grandTotal = total + tax + shipping;

  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(grandTotal, items.reduce((count, item) => count + item.quantity, 0));
    }
  }, [grandTotal, items]);

  useEffect(() => {
    setPaymentStep('checkout');
    setPaymentError(null);
  }, [paymentMethod]);

  const saveOrder = async (data: CheckoutForm, paymentStatus: 'pending' | 'paid' | 'failed') => {
    const orderData = {
      customer: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
      },
      items: items.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: grandTotal,
      tax,
      shipping,
      status: 'pending',
      paymentMethod: data.paymentMethod,
      bankName: data.paymentMethod === 'mobile_banking' ? data.bankName : undefined,
      paymentStatus,
    };

    const response = await axios.post('/api/orders', orderData);
    if (response.status !== 201) throw new Error('Failed to place order');

    localStorage.setItem('palpali_customer_email', data.email.trim().toLowerCase());
    if (paymentStatus !== 'failed') {
      useCartStore.getState().clearCart();
      toast.success(data.paymentMethod === 'cod' ? 'Order placed successfully!' : 'Payment successful!');
    } else {
      toast.error('Payment failed. You can retry or choose another method.');
    }
    window.location.href = `/order-confirmation?orderId=${response.data._id}`;
  };

  const simulatePayment = async (data: CheckoutForm) => {
    try {
      setIsSubmitting(true);
      setPaymentError(null);
      const paymentDelay = 900 + Math.random() * 600;
      await new Promise((resolve) => setTimeout(resolve, paymentDelay));
      await saveOrder(data, Math.random() < 0.8 ? 'paid' : 'failed');
    } catch (error) {
      const message = 'Failed to place order';
      setPaymentError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGateway = (data: CheckoutForm) => {
    if (data.paymentMethod === 'mobile_banking' && !data.bankName) {
      setPaymentError('Select your bank to continue.');
      return;
    }
    setPaymentError(null);
    setGatewayStep('login');
    setPaymentStep('gateway');
  };

  const confirmGatewayLogin = () => {
    if (!gatewayMobileRef.current?.value.trim() || !gatewayPinRef.current?.value.trim()) {
      setPaymentError('Enter your mobile number and PIN/MPIN to continue.');
      return;
    }
    setPaymentError(null);
    setGatewayStep('confirm');
  };

  const cancelGateway = () => {
    setPaymentStep('checkout');
    setGatewayStep('login');
    setPaymentError(null);
    if (gatewayMobileRef.current) gatewayMobileRef.current.value = '';
    if (gatewayPinRef.current) gatewayPinRef.current.value = '';
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (data.paymentMethod === 'cod') {
      try {
        setIsSubmitting(true);
        await saveOrder(data, 'pending');
      } catch (error) {
        setPaymentError('Failed to place order');
        toast.error('Failed to place order');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    if (data.paymentMethod === 'esewa' || data.paymentMethod === 'khalti' || data.paymentMethod === 'mobile_banking') {
      openGateway(data);
      return;
    }
    await simulatePayment(data);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Seo
          title="Checkout | Palpali Dhaka Textiles"
          description="Securely complete your order for authentic Dhaka textiles and Nepali handcrafted products."
        />
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600">Add items before checkout</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Seo
        title="Checkout | Palpali Dhaka Textiles"
        description="Securely complete your order for authentic Dhaka textiles and Nepali handcrafted products."
      />
      <h1 className="text-4xl font-serif font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info */}
            <div className="card p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">First Name</label>
                  <input
                    {...register('firstName', { required: true })}
                    className="input-base"
                    type="text"
                  />
                  {errors.firstName && <span className="text-red-600 text-sm">Required</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Last Name</label>
                  <input
                    {...register('lastName', { required: true })}
                    className="input-base"
                    type="text"
                  />
                  {errors.lastName && <span className="text-red-600 text-sm">Required</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                    className="input-base"
                    type="email"
                  />
                  {errors.email && <span className="text-red-600 text-sm">Valid email required</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Phone</label>
                  <input
                    {...register('phone', { required: true })}
                    className="input-base"
                    type="tel"
                  />
                  {errors.phone && <span className="text-red-600 text-sm">Required</span>}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">Shipping Address</h2>
              <div>
                <label className="block text-sm font-semibold mb-2">Address</label>
                <input
                  {...register('address', { required: true })}
                  className="input-base"
                  type="text"
                />
                {errors.address && <span className="text-red-600 text-sm">Required</span>}
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">City</label>
                  <input
                    {...register('city', { required: true })}
                    className="input-base"
                    type="text"
                  />
                  {errors.city && <span className="text-red-600 text-sm">Required</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">State</label>
                  <input
                    {...register('state', { required: true })}
                    className="input-base"
                    type="text"
                  />
                  {errors.state && <span className="text-red-600 text-sm">Required</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">ZIP Code</label>
                  <input
                    {...register('zipCode', { required: true })}
                    className="input-base"
                    type="text"
                  />
                  {errors.zipCode && <span className="text-red-600 text-sm">Required</span>}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">Payment Method</h2>
              <div className="grid gap-3">
                {[
                  { value: 'cod' as const, label: 'Cash on Delivery', description: 'Pay when your order arrives.', icon: Banknote },
                  { value: 'esewa' as const, label: 'eSewa', description: 'Pay securely with your eSewa wallet.', logo: 'esewa.png', color: '#58b947' },
                  { value: 'khalti' as const, label: 'Khalti', description: 'Pay securely with your Khalti wallet.', logo: 'khalti.png', color: '#5c2d91' },
                  { value: 'mobile_banking' as const, label: 'Mobile Banking', description: 'Pay through your preferred bank.', icon: Smartphone },
                  { value: 'card' as const, label: 'Credit/Debit Card', description: 'Visa, Mastercard, or other cards.', icon: CreditCard },
                ].map((option) => (
                  <label key={option.value} className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition ${paymentMethod === option.value ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                    <input {...register('paymentMethod')} type="radio" value={option.value} className="accent-primary" />
                    <span className="flex h-12 w-[120px] shrink-0 items-center justify-center">
                      {'logo' in option ? (
                        <>
                        <img
                          src={`/images/payment/${option.logo}`}
                          alt={option.label}
                          className="max-h-12 max-w-[120px] object-contain"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                            const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = 'inline';
                          }}
                        />
                        <span className="text-sm font-bold" style={{ color: option.color, display: 'none' }}>{option.label}</span>
                        </>
                      ) : (
                        <option.icon size={48} className="text-primary" />
                      )}
                    </span>
                    <span>
                      <span className="block font-semibold">{option.label}</span>
                      <span className="block text-sm text-gray-500">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === 'mobile_banking' && paymentStep === 'checkout' && (
                <div className="mt-5">
                  <label className="block text-sm font-semibold mb-2">Select Bank</label>
                  <select {...register('bankName', { required: true })} className="input-base">
                    <option value="">Choose your bank</option>
                    {banks.map((bank) => <option key={bank.name} value={bank.name}>{bank.name}</option>)}
                  </select>
                  {errors.bankName && <span className="text-red-600 text-sm">Required</span>}
                </div>
              )}

              {paymentStep === 'gateway' && (() => {
                const bank = banks.find((item) => item.name === watch('bankName'));
                const provider = paymentMethod === 'esewa'
                  ? { name: 'eSewa', logo: 'esewa.png', color: '#58b947' }
                  : paymentMethod === 'khalti'
                    ? { name: 'Khalti', logo: 'khalti.png', color: '#5c2d91' }
                    : bank || { name: 'Mobile Banking', logo: '', color: '#315f9b' };
                return (
                  <div className="mt-6 rounded-xl border p-5" style={{ borderColor: provider.color }}>
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white p-1">
                          {provider.logo ? (
                            <img src={`/images/payment/${provider.logo}`} alt={provider.name} className="max-h-full max-w-full object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; const fallback = event.currentTarget.nextElementSibling as HTMLElement | null; if (fallback) fallback.style.display = 'inline'; }} />
                          ) : null}
                          <span className="font-bold" style={{ color: provider.color, display: provider.logo ? 'none' : 'inline' }}>{provider.name}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: provider.color }}>{provider.name}</p>
                          <h3 className="text-xl font-serif font-bold">Payment</h3>
                        </div>
                      </div>
                      <span className="font-bold">Rs. {grandTotal.toFixed(2)}</span>
                    </div>
                    <p className="mb-4 text-sm text-gray-600">Merchant: Palpali Dhaka Textiles</p>
                    {gatewayStep === 'login' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold mb-1">Registered Mobile Number</label>
                            <p className="mb-2 text-xs text-gray-500">Mobile number linked to your account</p>
                            <input ref={gatewayMobileRef} className="input-base" type="tel" placeholder="Mobile number" autoComplete="tel" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2">PIN / MPIN</label>
                            <input ref={gatewayPinRef} className="input-base" type="password" placeholder="PIN / MPIN" autoComplete="off" />
                          </div>
                        </div>
                        <div className="mt-5 flex gap-3">
                          <button type="button" onClick={confirmGatewayLogin} className="btn-primary flex-1">Continue</button>
                          <button type="button" onClick={cancelGateway} className="btn-outline flex-1">Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="rounded-lg bg-gray-50 p-5 text-center">
                          <p className="text-sm text-gray-600">Confirm payment to Palpali Dhaka Textiles</p>
                          <p className="mt-2 text-3xl font-bold" style={{ color: provider.color }}>Rs. {grandTotal.toFixed(2)}</p>
                        </div>
                        <div className="mt-5 flex gap-3">
                          <button type="button" onClick={() => handleSubmit(simulatePayment)()} disabled={isSubmitting} className="btn-primary flex-1 disabled:opacity-50">
                            {isSubmitting ? 'Processing payment...' : 'Confirm Payment'}
                          </button>
                          <button type="button" onClick={cancelGateway} className="btn-outline flex-1">Cancel</button>
                        </div>
                      </>
                    )}
                    <p className="mt-4 text-center text-xs text-gray-400">Sandbox mode</p>
                  </div>
                );
              })()}

              {paymentMethod === 'card' && paymentStep === 'checkout' && (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Cardholder Name</label>
                    <input {...register('cardHolderName', { required: true })} className="input-base" type="text" placeholder="Full name as on card" />
                    {errors.cardHolderName && <span className="text-red-600 text-sm">Required</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Card Number</label>
                    <input {...register('cardNumber', { required: true })} className="input-base" type="text" placeholder="1234 5678 9012 3456" />
                    {errors.cardNumber && <span className="text-red-600 text-sm">Required</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                      <input {...register('expiryDate', { required: true })} className="input-base" type="text" placeholder="MM/YY" />
                      {errors.expiryDate && <span className="text-red-600 text-sm">Required</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">CVV</label>
                      <input {...register('cvv', { required: true })} className="input-base" type="text" placeholder="123" />
                      {errors.cvv && <span className="text-red-600 text-sm">Required</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {paymentError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {paymentError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              ) : (
                paymentMethod === 'cod' ? `Place Order (Rs. ${grandTotal.toFixed(2)})` : paymentMethod === 'card' ? `Pay & Place Order (Rs. ${grandTotal.toFixed(2)})` : 'Continue to Payment'
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-2xl font-serif font-bold mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4 pb-4 border-b">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 mb-4 pb-4 border-b">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>Rs. {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span>Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>Rs. {shipping.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">Rs. {grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
