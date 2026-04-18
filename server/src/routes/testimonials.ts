import { Router, Request, Response } from 'express';
import Testimonial from '../models/Testimonial';
import { requireAuth } from '../lib/auth';

const router = Router();

// GET /api/testimonials
router.get('/', async (_req: Request, res: Response) => {
  const testimonials = await Testimonial.find({ isPublished: { $ne: false } }).sort({ order: 1 });
  res.json(testimonials);
});

// POST /api/testimonials (protected)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const { name, content } = req.body;
  if (!name || !content) {
    res.status(400).json({ error: 'Name and content required' });
    return;
  }
  const testimonial = await Testimonial.create({ ...req.body, isPublished: req.body.isPublished ?? true });
  res.status(201).json(testimonial);
});

// PUT /api/testimonials/:id (protected)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(updated);
});

// DELETE /api/testimonials/:id (protected)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await Testimonial.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
