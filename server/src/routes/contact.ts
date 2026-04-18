import { Router, Request, Response } from 'express';
import Contact from '../models/Contact';
import { sendContactNotification } from '../lib/email';
import { requireAuth } from '../lib/auth';

const router = Router();

// POST /api/contact (public — contact form submission)
router.post('/', async (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.email || !data.message) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }

  // Save to MongoDB
  const submission = await Contact.create({ ...data, isRead: false });

  // Send email notification (non-blocking — don't fail if email fails)
  try {
    await sendContactNotification(data);
  } catch (emailError) {
    console.error('Email notification failed:', emailError);
  }

  res.json({ success: true, id: submission._id });
});

// GET /api/contact (admin — list all contacts)
router.get('/', requireAuth, async (_req: Request, res: Response) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json(contacts);
});

export default router;
