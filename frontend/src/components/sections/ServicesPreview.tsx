'use client';
import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import api from '@/lib/api';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { FaPalette, FaVideo, FaLayerGroup, FaFilm } from 'react-icons/fa';

/* ─── Animation Variants ────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: 'spring', bounce: 0.3, duration: 0.8 } 
  }
};

const serviceIcons: Record<string, any> = {
  design: FaPalette,
  video: FaVideo,
  FaLayerGroup,
  FaFilm,
};

export default function ServicesPreview() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    api('/api/services').then(r => r.json()).then(d => setServices(Array.isArray(d) ? d.slice(0, 4) : [])).catch(() => {});
  }, []);

  const defaultServices = [
    { _id: '1', title: 'Brand Identity', category: 'design', description: 'Logo design, brand guidelines, visual identity systems that make you stand out.' },
    { _id: '2', title: 'Social Media Design', category: 'design', description: 'Eye-catching posts, stories, and reels templates for your brand.' },
    { _id: '3', title: 'Video Editing', category: 'video', description: 'Professional cuts, color grading, motion graphics for your content.' },
    { _id: '4', title: 'Motion Graphics', category: 'video', description: 'Animated logos, intros, explainer videos that move your brand forward.' },
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  const { scrollYProgress } = useScroll();
  // Parallax the heading slightly slower than the scroll
  const headingY = useTransform(scrollYProgress, [0, 0.5], [0, -50]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 0]);

  return (
    <section className="site-container section-pad border-b border-[var(--border)] relative overflow-hidden">
      <motion.div
        style={{ y: headingY, opacity: headingOpacity }}
        className="flex flex-col items-center text-center mb-20 relative z-10"
      >
        <div className="max-w-2xl">
          <motion.p 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 rounded-full glass-card text-[var(--muted)] text-xs font-semibold tracking-widest uppercase mb-6"
          >
            Capabilities
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          >
            What I Do
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[var(--muted)] font-light text-lg mb-8 max-w-xl mx-auto"
          >
            Comprehensive creative services tailored to elevate your brand.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white hover:text-orange-400 transition-colors bg-white/5 px-6 py-3 rounded-full hover:bg-white/10 border border-white/5"
          >
            All Services <FiArrowRight />
          </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto relative z-10"
      >
        {displayServices.map((service, i) => {
          const Icon = serviceIcons[service.category] || FaPalette;
          return (
            <motion.div
              key={service._id}
              variants={cardVariants}
              whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 300, damping: 15 } }}
              className="group relative p-10 glass-card rounded-[2.5rem] hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 bg-[var(--card)] flex flex-col items-start overflow-hidden"
            >
              {/* Subtle animated gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />
              
              <div className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center mb-8 border border-white/10 bg-white/5 group-hover:scale-110 transition-transform duration-300 text-orange-500 shadow-lg shadow-black/20">
                <Icon size={28} />
              </div>
              <h3 className="relative z-10 text-2xl font-bold tracking-tight text-white mb-4">{service.title}</h3>
              <p className="relative z-10 text-[var(--muted)] font-light leading-relaxed max-w-sm">{service.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
