import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken, requireAuth } from '../lib/auth';
import Admin from '../models/Admin';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = await signToken({ username: admin.username, role: 'admin' });
    
    // Set cookie
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('portfolio_admin_token', token, {
      httpOnly: true,
      secure: isProd, // Only true in production with HTTPS
      sameSite: isProd ? 'none' : 'lax', // Lax for local dev, none for cross-site prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json({ success: true, username: admin.username });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  res.json({ authenticated: true, username: user.username });
});

// ─────────────────────────────────────────────────────────────────────────────
// Admin Management (Protected routes)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/auth/admins
router.get('/admins', requireAuth, async (_req: Request, res: Response) => {
  try {
    const admins = await Admin.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(admins);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post('/register', requireAuth, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || password.length < 6) {
      res.status(400).json({ error: 'Valid username and (min 6 char) password required' });
      return;
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      res.status(400).json({ error: 'Admin username already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({ username, passwordHash });
    await newAdmin.save();

    res.status(201).json({ success: true, admin: { _id: newAdmin._id, username: newAdmin.username } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/admins/:id
router.delete('/admins/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user; // Contains { username, role }

    const adminToDelete = await Admin.findById(id);
    if (!adminToDelete) {
      res.status(404).json({ error: 'Admin not found' });
      return;
    }

    // Optional: Prevent deleting yourself so you don't get locked out accidentally
    if (adminToDelete.username === currentUser.username) {
      res.status(400).json({ error: 'You cannot delete your own active account.' });
      return;
    }
    
    // Optional: Prevent deleting the super admin 'Brave@Pratik' if desired
    if (adminToDelete.username === 'Brave@Pratik') {
      res.status(403).json({ error: 'The primary admin account cannot be deleted.' });
      return;
    }

    await Admin.findByIdAndDelete(id);
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
