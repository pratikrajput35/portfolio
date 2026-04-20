import { Router, Request, Response } from 'express';
import Project from '../models/Project';
import { requireAuth } from '../lib/auth';
import { deleteManyFromCloudinary } from '../lib/cloudinary';

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Detect video provider from URL */
function detectProvider(url?: string): 'youtube' | 'drive' | null {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('drive.google.com')) return 'drive';
  return null;
}

/** Collect all Cloudinary image URLs from a project document */
function collectProjectImageUrls(project: any): string[] {
  const urls: string[] = [];
  if (project.coverImage) urls.push(project.coverImage);
  if (Array.isArray(project.images)) urls.push(...project.images);
  if (Array.isArray(project.gallery))
    urls.push(...project.gallery.filter((g: any) => g.type === 'image').map((g: any) => g.url));
  // Only return Cloudinary URLs (skip YouTube thumbnails / external URLs)
  return urls.filter(u => u && u.includes('cloudinary.com'));
}

// ─── GET /api/projects ────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  const { category, featured, all, page, limit } = req.query;

  const filter: Record<string, unknown> = {};
  if (all !== 'true') filter.isPublished = true;
  if (featured === 'true') filter.isFeatured = true;
  if (category) filter.category = category;

  // Pagination
  const pageNum  = Math.max(1, Number(page) || 1);
  const limitNum = limit ? Math.max(1, Math.min(100, Number(limit))) : 0; // 0 = no limit

  let query = Project.find(filter).populate('category').sort({ order: 1 });
  if (limitNum > 0) query = query.skip((pageNum - 1) * limitNum).limit(limitNum);

  const [projects, total] = await Promise.all([query, Project.countDocuments(filter)]);

  // If pagination requested, return metadata; otherwise array for backward-compat
  if (page || limit) {
    res.json({
      data: projects,
      total,
      page: pageNum,
      totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
    });
  } else {
    res.json(projects);
  }
});

// ─── POST /api/projects ───────────────────────────────────────────────────────
router.post('/', requireAuth, async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.title) { res.status(400).json({ error: 'Title required' }); return; }

  // Auto-detect videoProvider if not supplied
  if (!data.videoProvider && data.videoUrl) {
    data.videoProvider = detectProvider(data.videoUrl);
  }

  const project = await Project.create({ ...data, isPublished: data.isPublished ?? true });
  res.status(201).json(project);
});

// ─── PUT /api/projects/reorder ────────────────────────────────────────────────
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

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id).populate('category');
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(project);
});

// ─── PUT /api/projects/:id ────────────────────────────────────────────────────
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const data = req.body;

  // Auto-detect videoProvider if not supplied
  if (!data.videoProvider && data.videoUrl) {
    data.videoProvider = detectProvider(data.videoUrl);
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, data, { new: true }).populate('category');
  if (!updated) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(updated);
});

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const project = await Project.findById(req.params.id);
  if (!project) { res.status(404).json({ error: 'Not found' }); return; }

  // Collect all Cloudinary image URLs belonging to this project and clean them up
  const imageUrls = collectProjectImageUrls(project);
  if (imageUrls.length > 0) {
    console.log(`Deleting ${imageUrls.length} Cloudinary asset(s) for project "${project.title}"...`);
    await deleteManyFromCloudinary(imageUrls);
    console.log('Cloudinary cleanup done.');
  }

  await project.deleteOne();
  res.json({ success: true, deleted: imageUrls.length });
});

export default router;
