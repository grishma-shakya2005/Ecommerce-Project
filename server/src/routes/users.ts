import { Router, Response } from 'express';
import User from '../models/User.js';
import { AuthRequest, protect } from '../middleware/auth.js';

const router = Router();

// Get current user
router.get('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
router.patch('/me', protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true });
    res.json(user?.toJSON());
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export default router;
