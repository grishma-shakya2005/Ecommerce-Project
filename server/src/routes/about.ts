import { Router, Response } from 'express';
import AboutContent from '../models/AboutContent.js';

const router = Router();

const defaults = {
  heroTitle: 'About Palpali Dhaka',
  heroSubtitle: 'Preserving the art of handwoven Palpali Dhaka from Tansen, Palpa',
  storyHeading: 'Our story',
  storyParagraphs: [
    "Palpali Dhaka comes from Tansen, the hill town of Palpa, where hand-weaving has been part of daily life since the late 1950s. The fabric's roots go back to Bengal, which is how 'dhaka' got its name, but Palpa's weavers made it their own with bold geometric patterns that became a symbol of Nepali identity, most famously in the dhaka topi.",
    "For decades, looms in Tansen's workshops and homes supplied shops across Nepal. Then factory-made imitations and years of hardship reduced the number of weavers. Today the craft is slowly reviving, and every handwoven piece helps keep it alive.",
    'Palpali Dhaka Textiles began in 2024 when Grishma started sharing the heritage of authentic handwoven dhaka. We work with local weavers in Tansen, Palpa, to bring authentic handwoven dhaka to customers in Nepal and beyond.',
  ],
  storyImage: '/images/dhaka.jpg',
  values: [
    { title: 'Authenticity', text: 'Every piece is handwoven on traditional looms in Tansen.' },
    { title: 'Quality', text: 'Careful yarn selection and checking of every piece.' },
    { title: 'Fair work', text: 'Fair pay and steady work for local weavers.' },
  ],
  team: [{ name: '[NAME]', role: '[ROLE]', bio: '', photo: '', visible: true, order: 0 }],
  faqs: [
    { question: 'What is Palpali Dhaka?', answer: 'A handwoven cotton fabric from Tansen, Palpa, known for colorful geometric patterns, used for topis, scarves, bags and shawls', visible: true, order: 0 },
    { question: 'Is your dhaka handwoven?', answer: '[MY ANSWER]', visible: true, order: 1 },
    { question: 'Why is it called Dhaka if it comes from Nepal?', answer: 'The technique and patterns came from Bengal and the name stayed', visible: true, order: 2 },
    { question: 'How do I care for my dhaka item?', answer: 'Hand wash gently in cold water, dry in shade, iron on low heat', visible: true, order: 3 },
    { question: 'How long does delivery take?', answer: '[MY ANSWER]', visible: true, order: 4 },
    { question: 'Can I return or exchange an item?', answer: '[MY ANSWER]', visible: true, order: 5 },
    { question: 'Do you accept custom orders?', answer: '[MY ANSWER]', visible: true, order: 6 },
    { question: 'How can I pay?', answer: '[MY ANSWER]', visible: true, order: 7 },
  ],
};

export async function getOrCreateAbout() {
  let content = await AboutContent.findOne();
  if (!content) content = await AboutContent.create(defaults);
  else {
    let changed = false;
    if (!content.storyImage) {
      content.storyImage = defaults.storyImage;
      changed = true;
    }
    const founderParagraphIndex = content.storyParagraphs.findIndex((paragraph) =>
      paragraph.includes('[YEAR]') || paragraph.includes('[FOUNDER NAME]'),
    );
    if (founderParagraphIndex !== -1) {
      content.storyParagraphs[founderParagraphIndex] = defaults.storyParagraphs[2];
      changed = true;
    }
    if (changed) await content.save();
  }
  return content;
}

router.get('/', async (_req, res: Response) => {
  try {
    res.json(await getOrCreateAbout());
  } catch (error) {
    console.error('About content fetch failed:', error);
    res.status(500).json({ error: 'Failed to fetch About content' });
  }
});

export default router;
