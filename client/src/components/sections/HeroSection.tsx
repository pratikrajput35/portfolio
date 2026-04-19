'use client';
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence, type Variants } from 'framer-motion';
import Link from 'next/link';
import { FiArrowRight, FiPlay, FiChevronDown } from 'react-icons/fi';
import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

/* ─── Floating randomized orb ───────────────────────────────── */
function FloatingOrb({ x, y, size, color, delay }: {
  x: string; y: string; size: number; color: string; delay: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: 'blur(70px)', willChange: 'transform', transform: 'translateZ(0)' }}
      animate={{
        y: [0, -30, 15, -20, 0],
        x: [0, 15, -10, 20, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
        opacity: [0.15, 0.25, 0.18, 0.22, 0.15],
      }}
      transition={{
        duration: 10 + delay * 2,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  );
}



/* ─── Animation variants ────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const words = ['Designs', 'Videos', 'Brands', 'Stories'];

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [settings, setSettings] = useState<any>(null);
  const scrollRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    api('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const subheadline = settings?.heroSubheadline || 'Crafting visual experiences that captivate and convert.';

  return (
    <section
      ref={scrollRef}
      className="site-container relative min-h-[95vh] flex flex-col items-center justify-center overflow-hidden pt-24"
    >
      {/* ── Background orbs ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <FloatingOrb x="10%"  y="15%"  size={450} color="rgba(234, 88, 12, 0.25)" delay={0}   />
        <FloatingOrb x="65%"  y="5%"   size={350} color="rgba(249, 115, 22, 0.2)"  delay={2}   />
        <FloatingOrb x="40%"  y="55%"  size={400} color="rgba(194, 65, 12, 0.2)"   delay={4}   />
        <FloatingOrb x="80%"  y="60%"  size={280} color="rgba(249, 115, 22, 0.15)" delay={1.5} />
        <FloatingOrb x="-5%"  y="70%"  size={350} color="rgba(253, 186, 116, 0.1)" delay={3}   />
      </motion.div>

      {/* ── Dot grid ── */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '3rem 3rem' }}
      />

      {/* ── Content ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ opacity: textOpacity }}
        className="relative z-10 text-center max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card text-[var(--muted)] text-xs font-semibold uppercase tracking-widest mb-12"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          AVAILABLE FOR FREELANCE WORK
        </motion.div>

        {/* Main Headline */}
        <motion.div
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[1.05] mb-4 md:mb-8 flex flex-col items-center justify-center text-center"
        >
          <span className="block mb-2 md:mb-4">Crafting</span>
          <span className="font-serif italic text-white/90 font-light bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent pb-2">
            digital experiences
          </span>
        </motion.div>

        {/* Animated word */}
        <motion.div
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter mb-10 h-28 md:h-32 relative flex justify-center items-center overflow-hidden w-full max-w-4xl mx-auto"
          style={{ perspective: 1000 }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={wordIndex}
              initial={{ y: 70, opacity: 0, rotateX: -60, filter: 'blur(8px)', scale: 0.9 }}
              animate={{ y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ y: -70, opacity: 0, rotateX: 60, filter: 'blur(8px)', scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18, mass: 1 }}
              className="absolute w-full text-center bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent py-4 drop-shadow-lg"
            >
              {words[wordIndex]}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-16 font-light leading-relaxed"
        >
          {subheadline}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link
            href="/portfolio"
            className="flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-white text-black font-semibold text-sm tracking-widest uppercase hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-xl shadow-orange-500/15 hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            Explore Work <FiArrowRight size={16} />
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 px-10 py-5 rounded-full glass-card text-white font-semibold text-sm tracking-widest uppercase hover:bg-white/10 transition-colors"
          >
            <FiPlay size={16} /> Let's Talk
          </Link>
        </motion.div>


      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-[var(--muted)]"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        <span className="text-[10px] uppercase tracking-widest font-semibold">Scroll</span>
        <FiChevronDown size={16} />
      </motion.div>
    </section>
  );
}
