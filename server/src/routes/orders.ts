import { Router, Response } from 'express';
import Order, { ORDER_STATUSES, PAYMENT_METHODS, type OrderStatus, type PaymentMethod, type PaymentStatus } from '../models/Order.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  hashOrderData,
  signOrderHash,
  verifyOrderSignature,
} from '../utils/orderSignature.js';
import { notifyOrderStatus } from '../services/orderNotifications.js';

const router = Router();

// Create order
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { customer, items, total, tax, shipping } = req.body || {};

    if (!customer || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order requires customer info and at least one item' });
    }
    const paymentMethod = PAYMENT_METHODS.includes(req.body?.paymentMethod as PaymentMethod)
      ? req.body.paymentMethod as PaymentMethod
      : null;
    if (!paymentMethod) {
      return res.status(400).json({ error: 'A valid payment method is required' });
    }
    const bankName = paymentMethod === 'mobile_banking' && typeof req.body?.bankName === 'string'
      ? req.body.bankName.trim()
      : undefined;
    if (paymentMethod === 'mobile_banking' && !bankName) {
      return res.status(400).json({ error: 'A bank is required for mobile banking' });
    }
    const requestedPaymentStatus = ['pending', 'paid', 'failed'].includes(req.body?.paymentStatus)
      ? req.body.paymentStatus as PaymentStatus
      : 'pending';
    const paymentStatus: PaymentStatus = paymentMethod === 'cod' ? 'pending' : requestedPaymentStatus;

    const generatedOrderNumber = req.body?.orderNumber || `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const normalizedItems = items.map((item: any) => ({
      productId: item?.productId || '',
      quantity: Number(item?.quantity || 1),
      price: Number(item?.price || 0),
    }));
    const normalizedTotal = Number(total || 0);
    const signatureData = {
      orderNumber: generatedOrderNumber,
      items: normalizedItems,
      total: normalizedTotal,
      customerEmail: customer?.email || '',
    };
    // Hash and sign the critical transaction data before persisting the order.
    const transactionHash = hashOrderData(signatureData);
    const transactionSignature = signOrderHash(transactionHash);

    const order = new Order({
      ...req.body,
      orderNumber: generatedOrderNumber,
      status: req.body?.status || 'pending',
      paymentMethod,
      bankName,
      paymentStatus,
      customer: {
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
        city: customer?.city || '',
        state: customer?.state || '',
        zipCode: customer?.zipCode || '',
      },
      items: normalizedItems,
      total: normalizedTotal,
      tax: Number(tax || 0),
      shipping: Number(shipping || 0),
      transactionHash,
      transactionSignature,
    });

    await order.save();
    try {
      await notifyOrderStatus(order, 'pending');
    } catch (notificationError) {
      console.error('Order notification failed after order was saved:', notificationError);
    }
    res.status(201).json(order);
  } catch (error: any) {
    console.error('Order creation failed:', error);
    res.status(500).json({
      error: 'Failed to create order',
      details: error?.message || 'Unknown error'
    });
  }
});

// Advance one lifecycle stage and send the order status email.
router.patch('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    const nextStatus = ORDER_STATUSES[currentIndex + 1];
    if (!nextStatus || req.body?.status !== nextStatus) {
      return res.status(400).json({ error: `Next status must be ${nextStatus || 'none'}` });
    }

    order.status = nextStatus;
    if (nextStatus === 'payment_confirmed' && order.paymentMethod !== 'cod') order.paymentStatus = 'paid';
    await order.save();
    await notifyOrderStatus(order, nextStatus);
    res.json(order);
  } catch (error) {
    console.error('Order status update failed:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Recompute the transaction hash and verify its RSA signature.
router.get('/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const valid = verifyOrderSignature({
      orderNumber: order.orderNumber,
      items: order.items,
      total: order.total,
      customerEmail: order.customer.email,
    }, order.transactionHash, order.transactionSignature);

    console.log(`Order ${order.orderNumber} signature ${valid ? 'valid' : 'invalid'}`);
    res.json({ orderId: order.id, valid, message: valid ? 'Signature valid' : 'Signature invalid' });
  } catch (error) {
    console.error('Order signature verification failed:', error);
    res.status(500).json({ error: 'Failed to verify order signature' });
  }
});

// Get orders
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
