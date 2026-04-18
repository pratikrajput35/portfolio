import { Router, Request, Response } from 'express';
import Category from '../models/Category';
import { requireAuth } from '../lib/auth';

const router = Router();

// GET /api/categories
router.get('/', async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: { $ne: false } }).sort({ order: 1 });
  res.json(categories);
});

// POST /api/categories (protected)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  if (!data.slug) {
    data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  const category = await Category.create({ ...data, isActive: true, order: data.order ?? 0 });
  res.status(201).json(category);
});

// GET /api/categories/:id
router.get('/:id', async (req: Request, res: Response) => {
  const category = await Category.findById(req.params.id);
  if (!category) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(category);
});

// PUT /api/categories/:id (protected)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(updated);
});

// DELETE /api/categories/:id (protected)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true });
});

export default router;
