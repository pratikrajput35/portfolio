import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './lib/db';

// Routes
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import projectsRoutes from './routes/projects';
import blogRoutes from './routes/blog';
import contactRoutes from './routes/contact';
import servicesRoutes from './routes/services';
import testimonialsRoutes from './routes/testimonials';
import settingsRoutes from './routes/settings';
import uploadRoutes from './routes/upload';
import seedRoutes from './routes/seed';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: '*',
  })
);

app.use(cookieParser());

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/seed', seedRoutes);

// Admin contacts endpoint (maps to same contact route)
app.use('/api/admin/contacts', (req, _res, next) => {
  req.url = '/';
  next();
}, contactRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// User/Admin Model
import Admin from './models/Admin';
import bcrypt from 'bcryptjs';

// ─── Start ────────────────────────────────────────────────────────────────────
async function start() {
  await connectDB();

  // Seed initial Admin if no admins exist
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      console.log('No admins found in DB. Seeding default admin...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('BraveHeer@2004', salt);
      await Admin.create({ username: 'Brave@Pratik', passwordHash });
      console.log('Default admin seeded: Brave@Pratik');
    }
  } catch (err) {
    console.error('Error seeding default admin:', err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}

start();
