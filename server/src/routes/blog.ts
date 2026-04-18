import { Router, Request, Response } from 'express';
import BlogPost from '../models/BlogPost';
import { requireAuth } from '../lib/auth';

const router = Router();

// GET /api/blog
router.get('/', async (req: Request, res: Response) => {
  const all = req.query.all === 'true';
  const filter = all ? {} : { isPublished: true };
  const posts = await BlogPost.find(filter).sort({ createdAt: -1 });
  res.json(posts);
});

// POST /api/blog (protected)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title) { res.status(400).json({ error: 'Title required' }); return; }
  if (!data.slug) {
    data.slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();
  const post = await BlogPost.create(data);
  res.status(201).json(post);
});

// GET /api/blog/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  const post = await BlogPost.findOne({ slug: req.params.slug });
  if (!post) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(post);
});

// PUT /api/blog/:slug (protected)
router.put('/:slug', requireAuth, async (req: Request, res: Response) => {
  const data = req.body;
  if (data.isPublished && !data.publishedAt) data.publishedAt = new Date();
  const updated = await BlogPost.findOneAndUpdate({ slug: req.params.slug }, data, { new: true });
  if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(updated);
});

// DELETE /api/blog/:slug (protected)
router.delete('/:slug', requireAuth, async (req: Request, res: Response) => {
  const deleted = await BlogPost.findOneAndDelete({ slug: req.params.slug });
  if (!deleted) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ success: true });
});

export default router;
