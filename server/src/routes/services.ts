import { Router, Request, Response } from 'express';
import Service from '../models/Service';
import { requireAuth } from '../lib/auth';

const router = Router();

// GET /api/services
router.get('/', async (_req: Request, res: Response) => {
  const services = await Service.find({ isPublished: { $ne: false } }).sort({ order: 1 });
  res.json(services);
});

// POST /api/services (protected)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const service = await Service.create({ ...req.body, isPublished: req.body.isPublished ?? true });
  res.status(201).json(service);
});

// PUT /api/services/:id (protected)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(updated);
});

// DELETE /api/services/:id (protected)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export default router;
