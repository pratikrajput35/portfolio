import { Router, Request, Response } from 'express';
import { signToken, requireAuth } from '../lib/auth';

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@pratikrajput.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = await signToken({ email: ADMIN_EMAIL, role: 'admin' });
  
  // Set cookie
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('portfolio_admin_token', token, {
    httpOnly: true,
    secure: isProd, // Only true in production with HTTPS
    sameSite: isProd ? 'none' : 'lax', // Lax for local dev, none for cross-site prod
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });

  res.json({ success: true });
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('portfolio_admin_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ authenticated: true, email: user.email });
});

export default router;
