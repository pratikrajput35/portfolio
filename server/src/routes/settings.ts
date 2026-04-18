import { Router, Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
import { requireAuth } from '../lib/auth';

const router = Router();

// GET /api/settings
router.get('/', async (_req: Request, res: Response) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    // Create default settings doc if none exists
    settings = await SiteSettings.create({});
  }
  res.json(settings);
});

// PUT /api/settings (protected)
router.put('/', requireAuth, async (req: Request, res: Response) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create(req.body);
  } else {
    settings = await SiteSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
  }
  res.json({ success: true });
});

export default router;
