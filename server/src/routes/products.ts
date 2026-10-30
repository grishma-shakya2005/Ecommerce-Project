import { Router, Response } from 'express';
import { validationResult, body } from 'express-validator';
import Product from '../models/Product.js';
import { AuthRequest, protect } from '../middleware/auth.js';

const router = Router();

// Get all products
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const skip = ((page as number) - 1) * (limit as number);

    const query: any = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .skip(skip)
      .limit(limit as number);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / (limit as number))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
router.post(
  '/',
  protect,
  body('name').notEmpty(),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 }),
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = new Product(req.body);
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

export default router;
