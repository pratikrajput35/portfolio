import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  // Hero
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaLink: string;
  // About
  aboutName: string;
  aboutTitle: string;
  aboutBio: string;
  aboutImage?: string;
  skills: string[];
  stats: Array<{ label: string; value: string }>;
  // Visibility
  showTestimonials: boolean;
  showBlog: boolean;
  showServices: boolean;
  showFeaturedProjects: boolean;
  showNewsletter: boolean;
  // Footer
  footerText: string;
  // Contact
  contactHeadline: string;
  contactDescription: string;
  contactTitle: string;
  // Social
  instagram: string;
  youtube: string;
  linkedin: string;
  behance: string;
  twitter: string;
  whatsapp: string;
  email: string;
  phone: string;
  location: string;
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  // Pricing
  pricingTiers: Array<{
    name: string;
    price: string;
    features: string[];
    isPopular: boolean;
  }>;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    heroHeadline: { type: String, default: 'Creative Designer & Video Editor' },
    heroSubheadline: { type: String, default: 'Crafting visual experiences that captivate and convert.' },
    heroCtaText: { type: String, default: 'View My Work' },
    heroCtaLink: { type: String, default: '/portfolio' },
    heroSecondaryCtaText: { type: String, default: 'Get In Touch' },
    heroSecondaryCtaLink: { type: String, default: '/contact' },
    aboutName: { type: String, default: 'Pratik Rajput' },
    aboutTitle: { type: String, default: 'Creative Designer & Video Editor' },
    aboutBio: { type: String, default: "I'm a passionate creative professional specializing in graphic design and video editing." },
    aboutImage: String,
    skills: { type: [String], default: ['Adobe Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro', 'Figma', 'DaVinci Resolve'] },
    stats: { type: [{ label: String, value: String }], default: [] },
    showTestimonials: { type: Boolean, default: true },
    showBlog: { type: Boolean, default: true },
    showServices: { type: Boolean, default: true },
    showFeaturedProjects: { type: Boolean, default: true },
    showNewsletter: { type: Boolean, default: false },
    footerText: { type: String, default: '© 2025 Pratik Rajput. All rights reserved.' },
    contactHeadline: { type: String, default: 'Contact Me' },
    contactDescription: { type: String, default: "Have a project in mind? Let's talk about it." },
    contactTitle: { type: String, default: "Let's Work Together" },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    behance: { type: String, default: '' },
    twitter: { type: String, default: '' },
    whatsapp: { type: String, default: '9136543329' },
    email: { type: String, default: 'pratikrajput453@gmail.com' },
    phone: { type: String, default: '91365 43329' },
    location: { type: String, default: 'India (Remote Worldwide)' },
    seoTitle: { type: String, default: 'Pratik Rajput | Creative Designer & Video Editor' },
    seoDescription: { type: String, default: 'Professional graphic design and video editing services.' },
    seoKeywords: { type: String, default: 'graphic design, video editing, logo design, branding, freelance designer' },
    pricingTiers: {
      type: [{ name: String, price: String, features: [String], isPopular: Boolean }],
      default: [
        { name: 'Starter', price: '₹5,000', features: ['Logo Design', '2 Revisions', 'PNG/SVG files', '3 day delivery'], isPopular: false },
        { name: 'Professional', price: '₹12,000', features: ['Full Brand Identity', '5 Revisions', 'Brand Guidelines', 'Social Media Kit', '7 day delivery'], isPopular: true },
        { name: 'Premium', price: '₹25,000', features: ['Complete Branding', 'Unlimited Revisions', 'All file formats', 'Motion logo', 'Priority support'], isPopular: false },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
