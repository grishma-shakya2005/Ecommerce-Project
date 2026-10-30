import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { protectAdmin, AuthRequest } from '../middleware/auth.js';
import AboutContent from '../models/AboutContent.js';
import { getOrCreateAbout } from './about.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req: Request, file: Express.Multer.File, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
      return callback(new Error('Only jpg, png, and webp images are allowed'));
    }
    callback(null, true);
  },
});
const uploadDir = path.resolve(process.cwd(), '../client/public/uploads/about');

router.use(protectAdmin);

router.get('/', async (_req, res) => {
  try {
    res.json(await getOrCreateAbout());
  } catch (error) {
    console.error('Admin About fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch About content' });
  }
});

router.patch('/', async (req, res) => {
  try {
    const content = await getOrCreateAbout();
    const allowed = ['heroTitle', 'heroSubtitle', 'storyHeading', 'storyParagraphs', 'storyImage', 'values'];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) (content as any)[key] = req.body[key];
    });
    await content.save();
    res.json(content);
  } catch (error) {
    console.error('Admin About update failed:', error);
    res.status(500).json({ error: 'Failed to save About content' });
  }
});

router.post('/images', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    await fs.mkdir(uploadDir, { recursive: true });
    const extension = req.file.mimetype === 'image/jpeg' ? 'jpg' : req.file.mimetype.split('/')[1];
    const filename = `about-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    await fs.writeFile(path.join(uploadDir, filename), req.file.buffer);
    res.status(201).json({ path: `/uploads/about/${filename}` });
  } catch (error: any) {
    console.error('Admin About image upload failed:', error);
    res.status(400).json({ error: error.message || 'Failed to upload image' });
  }
});

router.patch('/team/:id', async (req, res) => {
  try {
    const content = await getOrCreateAbout();
    const member = content.team.find((entry) => String(entry._id) === req.params.id);
    if (!member) return res.status(404).json({ error: 'Team member not found' });
    Object.assign(member, req.body);
    await content.save();
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save team member' });
  }
});

router.post('/team', async (req, res) => {
  try {
    const content = await getOrCreateAbout();
    content.team.push({ ...req.body, visible: req.body.visible !== false, order: Number(req.body.order || content.team.length) });
    await content.save();
    res.status(201).json(content.team[content.team.length - 1]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add team member' });
  }
});

router.delete('/team/:id', async (req, res) => {
  try {
    const content = await getOrCreateAbout();
    const member = content.team.find((entry) => String(entry._id) === req.params.id);
    if (!member) return res.status(404).json({ error: 'Team member not found' });
    content.team = content.team.filter((entry) => String(entry._id) !== req.params.id) as typeof content.team;
    await content.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

router.patch('/faq/:id', async (req, res) => {
  try {
    const content = await getOrCreateAbout();
    const faq = content.faqs.find((entry) => String(entry._id) === req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    Object.assign(faq, req.body);
    await content.save();
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save FAQ' });
  }
});

router.post('/faq', async (req, res) => {
  try {
    const content = await getOrCreateAbout();
    content.faqs.push({ ...req.body, visible: req.body.visible !== false, order: Number(req.body.order || content.faqs.length) });
    await content.save();
    res.status(201).json(content.faqs[content.faqs.length - 1]);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add FAQ' });
  }
});

router.delete('/faq/:id', async (req, res) => {
  try {
    const content = await getOrCreateAbout();
    const faq = content.faqs.find((entry) => String(entry._id) === req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    content.faqs = content.faqs.filter((entry) => String(entry._id) !== req.params.id) as typeof content.faqs;
    await content.save();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

export default router;
