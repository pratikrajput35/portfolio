import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  // Hero
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCtaLink: string;
  heroSecondaryCtaText: string;
  heroSecondaryCtaLink: string;
  heroImage?: string;

  // About
  aboutPageSubtitle: string;
  aboutPageHeadline: string;
  aboutSkillsTitle: string;
  aboutExperienceTitle: string;
  aboutName: string;
  aboutTitle: string;
  aboutBio: string;
  aboutImage?: string;
  skills: string[];
  customSkills: { name: string; percentage: number; icon: string }[];
  experience: { year: string; title: string; description: string }[];
  aboutStats: { value: number; suffix: string; label: string }[];

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage?: string;

  // Social Links
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  behance?: string;
  twitter?: string;
  whatsapp?: string;

  // Contact Info Section
  contactTitle?: string;
  contactHeadline?: string;
  contactDescription?: string;

  // Contact
  email?: string;
  phone?: string;
  location?: string;

  // Sections visibility
  showTestimonials: boolean;
  showBlog: boolean;
  showServices: boolean;
  showFeaturedProjects: boolean;
  showNewsletter: boolean;

  // Footer
  footerText: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    heroHeadline: { type: String, default: 'Creative Designer & Video Editor' },
    heroSubheadline: { type: String, default: 'Crafting visual experiences that captivate and convert.' },
    heroCtaText: { type: String, default: 'View My Work' },
    heroCtaLink: { type: String, default: '/portfolio' },
    heroSecondaryCtaText: { type: String, default: 'Get In Touch' },
    heroSecondaryCtaLink: { type: String, default: '/contact' },
    heroImage: { type: String },

    aboutPageSubtitle: { type: String, default: 'About Me' },
    aboutPageHeadline: { type: String, default: 'The Person Behind The Work' },
    aboutSkillsTitle: { type: String, default: 'Skills & Tools' },
    aboutExperienceTitle: { type: String, default: 'Experience' },
    aboutName: { type: String, default: 'Pratik Rajput' },
    aboutTitle: { type: String, default: 'Creative Designer & Video Editor' },
    aboutBio: { type: String, default: 'I create stunning visuals and compelling video content that tells your brand story.' },
    aboutImage: { type: String },
    skills: [{ type: String }],
    customSkills: [{
      name: String,
      percentage: Number,
      icon: String
    }],
    experience: [
      {
        year: String,
        title: String,
        description: String,
      },
    ],
    aboutStats: {
      type: [{ value: Number, suffix: String, label: String }],
      default: [
        { value: 50, suffix: '+', label: 'Projects' },
        { value: 30, suffix: '+', label: 'Clients' },
        { value: 3, suffix: '+', label: 'Years' },
      ]
    },

    seoTitle: { type: String, default: 'Pratik Rajput | Creative Designer & Video Editor' },
    seoDescription: { type: String, default: 'Professional graphic design and video editing services.' },
    seoKeywords: { type: String, default: 'graphic design, video editing, creative services' },
    ogImage: { type: String },

    instagram: { type: String },
    youtube: { type: String },
    linkedin: { type: String },
    behance: { type: String },
    twitter: { type: String },
    whatsapp: { type: String, default: '9136543329' },

    contactTitle: { type: String, default: "Let's Work Together" },
    contactHeadline: { type: String, default: 'Contact Me' },
    contactDescription: { type: String, default: "Have a project in mind? Let's talk about it." },

    email: { type: String },
    phone: { type: String },
    location: { type: String },

    showTestimonials: { type: Boolean, default: true },
    showBlog: { type: Boolean, default: true },
    showServices: { type: Boolean, default: true },
    showFeaturedProjects: { type: Boolean, default: true },
    showNewsletter: { type: Boolean, default: false },

    footerText: { type: String, default: '© 2025 Pratik Rajput. All rights reserved.' },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
