import { Router, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { recommendForProduct, recommendForUser } from '../services/recommendations.js';

const router = Router();

router.get('/product/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const products = await recommendForProduct(req.params.productId);
    res.json({ products });
  } catch (error) {
    console.error('Product recommendations failed:', error);
    res.status(500).json({ error: 'Failed to fetch product recommendations' });
  }
});

router.get('/user', async (req: AuthRequest, res: Response) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const products = await recommendForUser(email);
    res.json({ products });
  } catch (error) {
    console.error('User recommendations failed:', error);
    res.status(500).json({ error: 'Failed to fetch user recommendations' });
  }
});

export default router;
