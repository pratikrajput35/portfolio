import { Router, Request, Response } from 'express';
import Project from '../models/Project';
import { requireAuth } from '../lib/auth';

const router = Router();

// GET /api/projects
router.get('/', async (req: Request, res: Response) => {
  const { category, featured, limit, all } = req.query;

  const filter: Record<string, unknown> = {};
  if (all !== 'true') filter.isPublished = true;
  if (featured === 'true') filter.isFeatured = true;
  if (category) filter.category = category;

  let query = Project.find(filter).populate('category').sort({ order: 1 });
  if (limit) query = query.limit(Number(limit));

  const projects = await query;
  res.json(projects);
});

// POST /api/projects (protected)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title) { res.status(400).json({ error: 'Title required' }); return; }
  const project = await Project.create({ ...data, isPublished: data.isPublished ?? true });
  res.status(201).json(project);
});

// PUT /api/projects/reorder (protected) — MUST be before /:id
router.put('/reorder', requireAuth, async (req: Request, res: Response) => {
  const { updates } = req.body;
  if (!Array.isArray(updates)) { res.status(400).json({ error: 'Invalid data' }); return; }
  await Promise.all(
    updates.map(({ id, order }: { id: string; order: number }) =>
      Project.findByIdAndUpdate(id, { order })
    )
  );
  res.json({ success: true });
});

// GET /api/projects/:id
router.get('/:id', async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id).populate('category');
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(project);
});

// PUT /api/projects/:id (protected)
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
  if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(updated);
});

// DELETE /api/projects/:id (protected)
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const deleted = await Project.findByIdAndDelete(req.params.id);
  if (!deleted) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true });
});

export default router;
