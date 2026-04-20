import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../lib/cloudinary';
import { requireAuth } from '../lib/auth';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// POST /api/upload (protected)
router.post('/', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    res.status(503).json({ error: 'Cloudinary not configured' });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  const folder       = (req.body.folder as string) || 'portfolio';
  const resourceType = (req.body.resourceType as 'image' | 'video' | 'auto') || 'auto';

  const result = await uploadToCloudinary(req.file.buffer, folder, resourceType);

  res.json({ url: result.url, publicId: result.publicId });
});

export default router;
