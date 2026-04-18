'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiStar } from 'react-icons/fi';
import { FaPalette, FaVideo } from 'react-icons/fa';
import api from '@/lib/api';

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    api('/api/services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d : [])).catch(() => {});
    api('/api/settings').then(r => r.json()).then(d => setSettings(d)).catch(() => {});
  }, []);

  const designServices = services.filter(s => s.category === 'design');
  const videoServices = services.filter(s => s.category === 'video');

  const defaultPricingTiers = settings?.pricingTiers || [
    { name: 'Starter', price: '₹5,000', features: ['Logo Design', '2 Revisions', 'PNG/SVG files', '3 day delivery'], isPopular: false },
    { name: 'Professional', price: '₹12,000', features: ['Full Brand Identity', '5 Revisions', 'Brand Guidelines', 'Social Media Kit', '7 day delivery'], isPopular: true },
    { name: 'Premium', price: '₹25,000', features: ['Complete Branding', 'Unlimited Revisions', 'All file formats', 'Motion logo', 'Priority support'], isPopular: false },
  ];

  return (
    <div className="site-container section-pad">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20 pt-16">
        <p className="inline-block px-4 py-1.5 rounded-full glass-card text-[var(--muted)] text-xs font-semibold tracking-widest uppercase mb-6">What I Offer</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Services</h1>
        <p className="text-[var(--muted)] max-w-xl mx-auto font-light text-xl">Premium design and video services to elevate your brand.</p>
      </motion.div>

      {/* Service Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24" id="design">
        {/* Design Services */}
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full border border-white/10 glass-card flex items-center justify-center text-orange-500"><FaPalette size={24} /></div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Graphic Design</h2>
          </div>
          {(designServices.length > 0 ? designServices : [
            { _id: '1', title: 'Brand Identity Design', description: 'Logo, color palette, typography, brand guidelines.' },
            { _id: '2', title: 'Social Media Graphics', description: 'Posts, stories, reels covers, and templates.' },
            { _id: '3', title: 'Print Design', description: 'Business cards, flyers, brochures, posters.' },
            { _id: '4', title: 'UI/UX Design', description: 'Website and app interface design.' },
          ]).map((service, i) => (
            <motion.div key={service._id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl glass-card transition-all duration-300 border border-white/5 hover:bg-orange-500/10 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] group">
              <h3 className="font-bold mb-3 tracking-tight text-xl text-white">{service.title}</h3>
              <p className="text-[var(--muted)] text-base font-light leading-relaxed">{service.description}</p>
              {service.features?.length > 0 && (
                <ul className="mt-5 space-y-3 border-t border-white/5 pt-5">
                  {service.features.map((f: string) => <li key={f} className="text-sm text-[var(--muted)] flex items-start gap-4"><FiCheck className="text-orange-500 mt-1 flex-shrink-0" size={16} />{f}</li>)}
                </ul>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Video Services */}
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6" id="video">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full border border-white/10 glass-card flex items-center justify-center text-orange-500"><FaVideo size={24} /></div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Video Editing</h2>
          </div>
          {(videoServices.length > 0 ? videoServices : [
            { _id: '5', title: 'YouTube Video Editing', description: 'Full-length video editing with cuts, transitions, and effects.' },
            { _id: '6', title: 'Reels & Shorts', description: 'Short-form video for Instagram, YouTube, and TikTok.' },
            { _id: '7', title: 'Motion Graphics', description: 'Animated logos, title cards, lower thirds.' },
            { _id: '8', title: 'Color Grading', description: 'Professional color correction and grading.' },
          ]).map((service, i) => (
            <motion.div key={service._id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 rounded-3xl glass-card transition-all duration-300 border border-white/5 hover:bg-orange-500/10 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] group">
              <h3 className="font-bold mb-3 tracking-tight text-xl text-white">{service.title}</h3>
              <p className="text-[var(--muted)] text-base font-light leading-relaxed">{service.description}</p>
              {service.features?.length > 0 && (
                <ul className="mt-5 space-y-3 border-t border-white/5 pt-5">
                  {service.features.map((f: string) => <li key={f} className="text-sm text-[var(--muted)] flex items-start gap-4"><FiCheck className="text-orange-500 mt-1 flex-shrink-0" size={16} />{f}</li>)}
                </ul>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Pricing */}
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16 pt-24">
        <p className="inline-block px-4 py-1.5 rounded-full glass-card text-[var(--muted)] text-xs font-semibold tracking-widest uppercase mb-6">Pricing</p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Investment</h2>
        <p className="text-[var(--muted)] max-w-xl mx-auto font-light text-lg">Choose the package that works best for your project.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
        {defaultPricingTiers.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-10 rounded-[2.5rem] flex flex-col transition-all duration-300 ${tier.isPopular ? 'glass border border-white/20 -translate-y-2' : 'glass-card border border-white/5 hover:border-white/20 hover:bg-white/5'}`}
          >
            {tier.isPopular && (
              <div className="absolute top-0 right-0 p-6 pointer-events-none">
                <span className="glass backdrop-blur-md bg-white/10 border-white/20 text-orange-500 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5"><FiStar size={12} fill="currentColor" /> Most Popular</span>
              </div>
            )}
            <h3 className={`text-xl font-bold mb-4 tracking-tight ${tier.isPopular ? 'text-white' : 'text-white'}`}>{tier.name}</h3>
            <div className={`text-4xl md:text-5xl font-serif italic mb-8 tracking-tighter ${tier.isPopular ? 'text-white' : 'text-[var(--muted)]'}`}>{tier.price}</div>
            
            <ul className="space-y-4 mb-10 flex-1">
              {tier.features.map(f => (
                <li key={f} className={`flex items-start gap-3 text-sm font-light ${tier.isPopular ? 'text-white/80' : 'text-[var(--muted)]'}`}>
                  <FiCheck className={`mt-0.5 shrink-0 ${tier.isPopular ? 'text-orange-400' : 'text-white/30'}`} size={16} />
                  {f}
                </li>
              ))}
            </ul>
            
            <a href="/contact" className={`w-full inline-flex items-center justify-center py-4 rounded-full text-sm font-bold tracking-wide transition-colors ${tier.isPopular ? 'bg-white text-black hover:bg-orange-500 hover:text-white' : 'glass-card text-white hover:bg-white/10 hover:text-white border border-white/10'}`}>
              Get Started
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
