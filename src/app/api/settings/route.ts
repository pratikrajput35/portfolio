import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

const DEFAULTS = {
  heroHeadline: 'Creative Designer & Video Editor',
  heroSubheadline: 'Crafting visual experiences that captivate and convert.',
  heroCtaText: 'View My Work',
  heroCtaLink: '/portfolio',
  heroSecondaryCtaText: 'Get In Touch',
  heroSecondaryCtaLink: '/contact',
  aboutName: 'Pratik Rajput',
  aboutTitle: 'Creative Designer & Video Editor',
  aboutBio: 'I\'m a passionate creative professional specializing in graphic design and video editing. With 3+ years of experience, I\'ve helped brands tell their stories through stunning visuals and compelling video content.',
  skills: ['Adobe Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', 'Figma', 'DaVinci Resolve'],
  showTestimonials: true,
  showBlog: true,
  showServices: true,
  showFeaturedProjects: true,
  showNewsletter: false,
  footerText: '© 2025 Pratik Rajput. All rights reserved.',
  contactHeadline: 'Contact Me',
  contactDescription: 'Have a project in mind? Let\'s talk about it.',
  contactTitle: 'Let\'s Work Together',
  instagram: '',
  youtube: '',
  linkedin: '',
  behance: '',
  twitter: '',
  whatsapp: '9136543329',
  email: 'pratikrajput453@gmail.com',
  phone: '91365 43329',
  location: 'India (Remote Worldwide)',
  seoTitle: 'Pratik Rajput | Creative Designer & Video Editor',
  seoDescription: 'Professional graphic design and video editing services.',
  seoKeywords: 'graphic design, video editing, logo design, branding, freelance designer',
  pricingTiers: [
    { name: 'Starter', price: '₹5,000', features: ['Logo Design', '2 Revisions', 'PNG/SVG files', '3 day delivery'], isPopular: false },
    { name: 'Professional', price: '₹12,000', features: ['Full Brand Identity', '5 Revisions', 'Brand Guidelines', 'Social Media Kit', '7 day delivery'], isPopular: true },
    { name: 'Premium', price: '₹25,000', features: ['Complete Branding', 'Unlimited Revisions', 'All file formats', 'Motion logo', 'Priority support'], isPopular: false },
  ]
};

export async function GET() {
  const settings = db.getSettings('settings', DEFAULTS);
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const data = await request.json();
  db.setSettings('settings', { ...DEFAULTS, ...data });
  return NextResponse.json({ success: true });
}
