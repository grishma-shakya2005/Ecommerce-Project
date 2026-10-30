import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import Order, { ORDER_STATUSES, type OrderStatus } from '../models/Order.js';
import { protectAdmin, AuthRequest } from '../middleware/auth.js';
import { notifyOrderStatus } from '../services/orderNotifications.js';
import ContactMessage from '../models/ContactMessage.js';

const router = Router();
const jwtSecret = () => process.env.JWT_SECRET || 'your-secret-key';

router.post(
  '/auth/login',
  body('username').notEmpty(),
  body('password').notEmpty(),
  (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const configuredUsername = process.env.ADMIN_USERNAME?.trim();
    const configuredPassword = process.env.ADMIN_PASSWORD?.trim();
    const username = String(req.body.username).trim();
    const password = String(req.body.password).trim();

    if (
      username !== configuredUsername ||
      password !== configuredPassword
    ) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', username },
      jwtSecret(),
      { expiresIn: '8h' },
    );
    return res.json({ token, admin: { username } });
  },
);

router.use(protectAdmin);

router.get('/dashboard', async (_req, res) => {
  try {
    const [totalProducts, totalOrders, revenue, statusCounts] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    const ordersByStatus = ORDER_STATUSES.reduce<Record<string, number>>((result, status) => {
      result[status] = statusCounts.find((entry) => entry._id === status)?.count || 0;
      return result;
    }, {});

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Admin dashboard fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

router.get('/products', async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const categories = [...new Set(products.map((product) => product.category))].sort();
    res.json({ products, categories });
  } catch (error) {
    console.error('Admin product fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post(
  '/products',
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('description').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const images = Array.isArray(req.body.images)
        ? req.body.images.filter(Boolean)
        : [req.body.image || ''];
      const product = await Product.create({
        ...req.body,
        images,
        sku: req.body.sku || `PD-${Date.now()}`,
        price: Number(req.body.price),
        stock: Number(req.body.stock),
      });
      res.status(201).json(product);
    } catch (error) {
      console.error('Admin product creation failed:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  },
);

router.patch('/products/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.image !== undefined) updates.images = [updates.image];
    delete updates.image;
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Admin product update failed:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Admin product deletion failed:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const query: Record<string, unknown> = {};
    if (req.query.status && ORDER_STATUSES.includes(req.query.status as OrderStatus)) {
      query.status = req.query.status;
    }
    if (req.query.customer) {
      const customer = String(req.query.customer).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { orderNumber: { $regex: customer, $options: 'i' } },
        { 'customer.firstName': { $regex: customer, $options: 'i' } },
        { 'customer.lastName': { $regex: customer, $options: 'i' } },
        { 'customer.email': { $regex: customer, $options: 'i' } },
      ];
    }
    res.json(await Order.find(query).sort({ createdAt: -1 }));
  } catch (error) {
    console.error('Admin order fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Admin order detail fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const nextStatus = req.body?.status as OrderStatus;
    const currentIndex = ORDER_STATUSES.indexOf(order.status);
    if (nextStatus !== ORDER_STATUSES[currentIndex + 1]) {
      return res.status(400).json({ error: `Next status must be ${ORDER_STATUSES[currentIndex + 1] || 'none'}` });
    }
    order.status = nextStatus;
    if (nextStatus === 'payment_confirmed' && order.paymentMethod !== 'cod') order.paymentStatus = 'paid';
    await order.save();
    await notifyOrderStatus(order, nextStatus);
    res.json(order);
  } catch (error) {
    console.error('Admin order status update failed:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

router.get('/messages', async (_req, res) => {
  try {
    res.json(await ContactMessage.find().sort({ createdAt: -1 }));
  } catch (error) {
    console.error('Admin contact message fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

export default router;
