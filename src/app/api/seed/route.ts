import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

const CATEGORIES = [
  { name: 'Brand Design',    slug: 'brand-design',    description: 'Logo, identity, and brand systems.', order: 10 },
  { name: 'UI/UX Design',    slug: 'ui-ux-design',    description: 'User interface and experience design.', order: 11 },
  { name: 'Motion Graphics', slug: 'motion-graphics', description: 'Animation, video editing, and visual FX.', order: 12 },
  { name: 'Cyber Security',  slug: 'cyber-security',  description: 'Penetration testing, audits, and awareness.', order: 13 },
];

// High-quality Unsplash images per category
const COVER_IMAGES: Record<string, string[]> = {
  'brand-design':    [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80',
    'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1200&q=80',
  ],
  'ui-ux-design':    [
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
    'https://images.unsplash.com/photo-1545235617-9465d2a55698?w=1200&q=80',
  ],
  'motion-graphics': [
    'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=1200&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
  ],
  'cyber-security':  [
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80',
  ],
};

export async function GET() {
  try {
    // ── 1. Upsert categories ──────────────────────────────────────
    const existingCats: any[] = db.find('categories');
    const catIdMap: Record<string, string> = {};

    for (const cat of CATEGORIES) {
      const existing = existingCats.find((c: any) => c.slug === cat.slug);
      if (existing) {
        catIdMap[cat.slug] = existing._id;
      } else {
        const newCat = db.create('categories', { ...cat, isActive: true });
        catIdMap[cat.slug] = newCat._id;
      }
    }

    // ── 2. Seed projects ──────────────────────────────────────────
    const seeds = [
      {
        title: 'NeonVault Brand Identity',
        slug: 'neonvault-brand-identity',
        shortDescription: 'Complete brand overhaul for a crypto-storage startup — logo, palette, and design system.',
        description: `NeonVault needed an identity that felt both trustworthy and cutting-edge. I developed a full brand system including a custom wordmark, dark-mode-first color palette (electric cyan and deep navy), iconography library, and a 40-page brand guidelines document. The result increased their investor pitch conversion rate by 34%.`,
        categorySlug: 'brand-design',
        coverImage: COVER_IMAGES['brand-design'][0],
        images: [COVER_IMAGES['brand-design'][1]],
        client: 'NeonVault Inc.',
        tags: ['Branding', 'Logo Design', 'Typography', 'Color Theory'],
        isFeatured: true,
        order: 10,
      },
      {
        title: 'Helix Studio Visual Identity',
        slug: 'helix-studio-visual-identity',
        shortDescription: 'Minimal yet bold brand for a creative production house in Mumbai.',
        description: `Helix Studio wanted to stand out in the competitive Mumbai film production scene. I crafted a geometric wordmark inspired by DNA helixes, paired with a warm metallic palette and editorial-style typography.`,
        categorySlug: 'brand-design',
        coverImage: COVER_IMAGES['brand-design'][1],
        images: [],
        client: 'Helix Studio',
        tags: ['Branding', 'Art Direction', 'Print Design'],
        isFeatured: false,
        order: 11,
      },
      {
        title: 'ShieldDash — SOC Analytics Platform',
        slug: 'shielddash-soc-analytics',
        shortDescription: 'Dark-mode SaaS dashboard UI for a Security Operations Center team.',
        description: `ShieldDash is a real-time threat analytics platform for enterprise SOC teams. I led the end-to-end UX design: user research, journey mapping, high-fidelity Figma prototypes, and a comprehensive design system. Reduced analyst response time by 22% in beta testing.`,
        categorySlug: 'ui-ux-design',
        coverImage: COVER_IMAGES['ui-ux-design'][0],
        images: [COVER_IMAGES['ui-ux-design'][1]],
        client: 'DataShield Pvt. Ltd.',
        tags: ['UI Design', 'UX Research', 'Figma', 'SaaS', 'Dark Mode'],
        isFeatured: true,
        order: 12,
      },
      {
        title: 'Krypt — Crypto Wallet Mobile App',
        slug: 'krypt-crypto-wallet-app',
        shortDescription: 'iOS & Android UX design for a non-custodial crypto wallet with DeFi features.',
        description: `Krypt required a seamless onboarding flow for non-technical users entering the DeFi space. I designed a 3-screen onboarding, biometric auth flow, portfolio overview, and in-app swap interface — within a strict WCAG 2.1 AA accessibility framework.`,
        categorySlug: 'ui-ux-design',
        coverImage: COVER_IMAGES['ui-ux-design'][1],
        images: [],
        client: 'Krypt Labs',
        tags: ['Mobile UI', 'UX Design', 'DeFi', 'Figma', 'Accessibility'],
        isFeatured: true,
        order: 13,
      },
      {
        title: 'CyberWeek 2024 — Conference Opener',
        slug: 'cyberweek-2024-opener',
        shortDescription: '90-second cinematic opener video for India\'s largest cybersecurity conference.',
        description: `Produced a high-impact 90-second conference opener for CyberWeek 2024, featuring glitch-art transitions, 3D network topology animations, and cinematic sound design. Screened to 5,000+ security professionals and went viral on LinkedIn with 2M+ organic views.`,
        categorySlug: 'motion-graphics',
        coverImage: COVER_IMAGES['motion-graphics'][0],
        images: [COVER_IMAGES['motion-graphics'][1]],
        client: 'CyberWeek India',
        tags: ['Motion Design', 'After Effects', 'Video Editing', 'Glitch Art'],
        isFeatured: true,
        order: 14,
      },
      {
        title: 'Phantom VPN — Product Launch Reel',
        slug: 'phantom-vpn-launch-reel',
        shortDescription: '60-second animated product explainer for a VPN startup\'s App Store launch.',
        description: `Created a kinetic-typography and motion-graphics explainer for Phantom VPN's iOS launch — breaking down complex privacy concepts into digestible animations, resulting in a 40% uplift in App Store conversions in the first month.`,
        categorySlug: 'motion-graphics',
        coverImage: COVER_IMAGES['motion-graphics'][1],
        images: [],
        client: 'Phantom VPN',
        tags: ['Explainer Video', 'Motion Graphics', 'After Effects'],
        isFeatured: false,
        order: 15,
      },
      {
        title: 'PenTest Pro — Full Web App Audit',
        slug: 'pentest-pro-web-audit',
        shortDescription: 'Comprehensive penetration test for a fintech platform handling ₹50Cr+ monthly transactions.',
        description: `Conducted a black-box penetration test on a fintech web application and its REST APIs. Discovered and responsibly disclosed 14 vulnerabilities including 2 Critical (SQLi, IDOR), 5 High, and 7 Medium severity issues. The client achieved SOC 2 Type II compliance within 3 months.`,
        categorySlug: 'cyber-security',
        coverImage: COVER_IMAGES['cyber-security'][0],
        images: [COVER_IMAGES['cyber-security'][1]],
        client: 'Finova Payments (Confidential)',
        tags: ['Penetration Testing', 'OWASP', 'SQLi', 'XSS', 'API Security'],
        isFeatured: true,
        order: 16,
      },
      {
        title: 'SecureAware — Phishing Simulation Campaign',
        slug: 'secureaware-phishing-campaign',
        shortDescription: 'Social engineering assessment and training program for a 500-employee enterprise.',
        description: `Designed a 3-phase phishing simulation for a 500-person manufacturing firm. After custom security awareness training, the click rate dropped from 67% to 8% — below the 10% industry benchmark. Also delivered dark-web monitoring for executive accounts.`,
        categorySlug: 'cyber-security',
        coverImage: COVER_IMAGES['cyber-security'][1],
        images: [],
        client: 'Redacted (Manufacturing)',
        tags: ['Social Engineering', 'Phishing', 'Security Awareness', 'Red Team'],
        isFeatured: false,
        order: 17,
      },
    ];

    const existingProjects: any[] = db.find('projects');
    let seededCount = 0;

    for (const seed of seeds) {
      const { categorySlug, ...rest } = seed;
      const catId = catIdMap[categorySlug];
      if (!catId) continue;

      // Skip if slug already exists
      const alreadyExists = existingProjects.find((p: any) => p.slug === rest.slug);
      if (alreadyExists) continue;

      db.create('projects', { ...rest, category: catId, isPublished: true });
      seededCount++;
    }

    return NextResponse.json({
      message: 'Seeded successfully!',
      categories: Object.keys(catIdMap).length,
      projectsAdded: seededCount,
    });
  } catch (err: any) {
    console.error('[SEED ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
