import { Router, Request, Response } from 'express';
import Category from '../models/Category';
import Project from '../models/Project';

const router = Router();

const CATEGORIES = [
  { name: 'Brand Design',    slug: 'brand-design',    description: 'Logo, identity, and brand systems.', order: 10 },
  { name: 'UI/UX Design',    slug: 'ui-ux-design',    description: 'User interface and experience design.', order: 11 },
  { name: 'Motion Graphics', slug: 'motion-graphics', description: 'Animation, video editing, and visual FX.', order: 12 },
  { name: 'Cyber Security',  slug: 'cyber-security',  description: 'Penetration testing, audits, and awareness.', order: 13 },
];

const COVER_IMAGES: Record<string, string[]> = {
  'brand-design':    ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80', 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1200&q=80'],
  'ui-ux-design':    ['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80', 'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&q=80'],
  'motion-graphics': ['https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=1200&q=80', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80'],
  'cyber-security':  ['https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80'],
};

// GET /api/seed
router.get('/', async (_req: Request, res: Response) => {
  // Upsert categories
  const catIdMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    let existing = await Category.findOne({ slug: cat.slug });
    if (!existing) {
      existing = await Category.create({ ...cat, isActive: true });
    }
    catIdMap[cat.slug] = existing._id.toString();
  }

  // Seed projects
  const seeds = [
    { title: 'NeonVault Brand Identity', slug: 'neonvault-brand-identity', shortDescription: 'Complete brand overhaul for a crypto-storage startup.', description: 'NeonVault needed an identity that felt both trustworthy and cutting-edge. I developed a full brand system.', categorySlug: 'brand-design', coverImage: COVER_IMAGES['brand-design'][0], images: [COVER_IMAGES['brand-design'][1]], client: 'NeonVault Inc.', tags: ['Branding', 'Logo Design'], isFeatured: true, order: 10 },
    { title: 'Helix Studio Visual Identity', slug: 'helix-studio-visual-identity', shortDescription: 'Minimal yet bold brand for a creative production house.', description: 'Helix Studio wanted to stand out in the competitive Mumbai film production scene.', categorySlug: 'brand-design', coverImage: COVER_IMAGES['brand-design'][1], images: [], client: 'Helix Studio', tags: ['Branding', 'Art Direction'], isFeatured: false, order: 11 },
    { title: 'ShieldDash — SOC Analytics Platform', slug: 'shielddash-soc-analytics', shortDescription: 'Dark-mode SaaS dashboard UI for a Security Operations Center.', description: 'ShieldDash is a real-time threat analytics platform for enterprise SOC teams.', categorySlug: 'ui-ux-design', coverImage: COVER_IMAGES['ui-ux-design'][0], images: [COVER_IMAGES['ui-ux-design'][1]], client: 'DataShield Pvt. Ltd.', tags: ['UI Design', 'UX Research', 'Figma'], isFeatured: true, order: 12 },
    { title: 'Krypt — Crypto Wallet Mobile App', slug: 'krypt-crypto-wallet-app', shortDescription: 'iOS & Android UX design for a non-custodial crypto wallet.', description: 'Krypt required a seamless onboarding flow for non-technical users entering the DeFi space.', categorySlug: 'ui-ux-design', coverImage: COVER_IMAGES['ui-ux-design'][1], images: [], client: 'Krypt Labs', tags: ['Mobile UI', 'UX Design'], isFeatured: true, order: 13 },
    { title: 'CyberWeek 2024 — Conference Opener', slug: 'cyberweek-2024-opener', shortDescription: "90-second cinematic opener for India's largest cybersecurity conference.", description: 'Produced a high-impact 90-second conference opener for CyberWeek 2024.', categorySlug: 'motion-graphics', coverImage: COVER_IMAGES['motion-graphics'][0], images: [COVER_IMAGES['motion-graphics'][1]], client: 'CyberWeek India', tags: ['Motion Design', 'After Effects'], isFeatured: true, order: 14 },
    { title: 'PenTest Pro — Full Web App Audit', slug: 'pentest-pro-web-audit', shortDescription: 'Comprehensive penetration test for a fintech platform.', description: 'Conducted a black-box penetration test on a fintech web application and its REST APIs.', categorySlug: 'cyber-security', coverImage: COVER_IMAGES['cyber-security'][0], images: [COVER_IMAGES['cyber-security'][1]], client: 'Finova Payments', tags: ['Penetration Testing', 'OWASP'], isFeatured: true, order: 15 },
  ];

  let seededCount = 0;
  for (const seed of seeds) {
    const { categorySlug, ...rest } = seed;
    const catId = catIdMap[categorySlug];
    if (!catId) continue;
    const exists = await Project.findOne({ slug: rest.slug });
    if (!exists) {
      await Project.create({ ...rest, category: catId, isPublished: true });
      seededCount++;
    }
  }

  res.json({ message: 'Seeded successfully!', categories: Object.keys(catIdMap).length, projectsAdded: seededCount });
});

export default router;
