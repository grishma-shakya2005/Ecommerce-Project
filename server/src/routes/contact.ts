import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import ContactMessage from '../models/ContactMessage.js';

const router = Router();

router.post(
  '/',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  async (req, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const contactMessage = await ContactMessage.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone || undefined,
        subject: req.body.subject?.trim() || 'General inquiry',
        message: req.body.message,
      });
      res.status(201).json({ message: 'Message sent successfully', id: contactMessage.id });
    } catch (error) {
      console.error('Contact message save failed:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  },
);

export default router;
