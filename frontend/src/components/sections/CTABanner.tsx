'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

/* ─── Animation Variants ────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: 'spring', bounce: 0.3, duration: 1,
      staggerChildren: 0.15,
      delayChildren: 0.2
    } 
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.4 } }
};

export default function CTABanner() {
  const containerRef = useRef<HTMLElement>(null);
  
  // Use scroll without 'target' ref constraint, bounding based on global scroll
  // This avoids hydration errors but still ties to scroll metrics
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={containerRef} className="site-container section-pad relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 glass-card rounded-[3rem] p-12 md:p-24 text-center bg-[#080808]/50 overflow-hidden shadow-2xl shadow-orange-500/5 group border border-white/5"
      >
        {/* Subtle grid pattern background with parallax */}
        <motion.div 
          style={{ 
            backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', 
            backgroundSize: '2rem 2rem',
            y: bgY
          }} 
          className="absolute inset-0 -top-[50%] -bottom-[50%] opacity-[0.03] pointer-events-none transition-opacity duration-1000 group-hover:opacity-10" 
        />
        
        {/* Animated glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-orange-500/10 blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.p variants={itemVariants} className="inline-block px-4 py-1.5 rounded-full glass-card text-[var(--muted)] text-xs font-semibold tracking-widest uppercase mb-6 shadow-lg shadow-black/20">
            Let's Collaborate
          </motion.p>
          <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tighter text-white">
            Ready to enhance <br /> <span className="font-serif italic text-white/90 font-light">your visual presence?</span>
          </motion.h2>
          <motion.p variants={itemVariants} className="text-[var(--muted)] text-lg mb-12 font-light max-w-2xl mx-auto leading-relaxed">
            Whether you need a full brand overhaul or a single eye-catching video, I'm here to bring your vision to life.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/contact"
              className="group/btn relative inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white text-black font-semibold text-sm tracking-widest uppercase hover:text-white transition-all shadow-xl hover:shadow-orange-500/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                Start a Project <FiArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full glass-card text-white font-semibold text-sm tracking-widest uppercase hover:bg-white/10 hover:border-white/20 transition-all border border-white/10"
            >
              View Portfolio
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
