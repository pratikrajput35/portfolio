'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiExternalLink, FiLayers, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '@/lib/api';

/* ─── Marquee strip ─────────────────────────────────────────── */
const TECH_TAGS = [
  'Brand Design', 'UI/UX', 'Motion Graphics', 'Cyber Security', 'Penetration Testing',
  'Figma', 'After Effects', 'OWASP', 'SOC 2', 'TypeScript', 'Next.js', 'Tailwind',
  'Logo Design', 'Dark Mode', 'React', 'API Security', 'Red Team', 'OSINT',
];

function Marquee() {
  return (
    <div className="w-full overflow-hidden py-4 mb-12 border-y border-[var(--border)] relative">
      <div className="flex gap-8 animate-marquee whitespace-nowrap will-change-transform">
        {[...TECH_TAGS, ...TECH_TAGS].map((tag, i) => (
          <span key={i} className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-orange-500 inline-block" />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Skeleton Card (shown while loading) ───────────────────── */
function SkeletonCard() {
  return (
    <div className="break-inside-avoid pb-6">
      <div className="overflow-hidden bg-[var(--card)] rounded-[2rem] border border-[var(--border)] mb-4 animate-pulse">
        {/* Fake image — random heights for masonry feel */}
        <div className="w-full bg-white/5" style={{ aspectRatio: '4/3' }} />
      </div>
      <div className="px-2 space-y-2">
        <div className="h-5 w-3/4 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-3 w-full rounded-lg bg-white/5 animate-pulse" />
        <div className="h-3 w-2/3 rounded-lg bg-white/5 animate-pulse" />
        <div className="flex gap-1.5 mt-1">
          <div className="h-5 w-14 rounded-full bg-white/5 animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ─── Card variants ─────────────────────────────────────────── */
const cardVariants: Variants = {
  hidden:  { opacity: 0, y: 30, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.96, y: -15, transition: { duration: 0.25 } },
};

/* ─── Project Card ──────────────────────────────────────────── */
function ProjectCard({ project, index }: { project: any; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Only Cloudinary-hosted videos used for hover; YouTube links are not preloadable
  const galleryVideos  = project.gallery?.filter((g: any) => g.type === 'video') || [];
  const hoverVideoSrc  = galleryVideos[0]?.url ?? null; // only direct video files
  const allImages      = [
    project.coverImage,
    ...(project.gallery?.filter((g: any) => g.type === 'image').map((g: any) => g.url) || []),
    ...(project.images || []),
  ].filter(Boolean);
  const uniqueImages    = useMemo(() => [...new Set(allImages)] as string[], [project._id]);
  const hasMultipleImages = uniqueImages.length > 1;

  const cardRef  = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { amount: 0.6, margin: '0px 0px -10% 0px' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const v = cardRef.current?.querySelector('video');
    if (isInView) {
      setHovered(true);
      if (v) { v.muted = true; setIsMuted(true); v.play().catch(() => {}); }
    } else {
      setHovered(false);
      if (v) { v.pause(); v.currentTime = 0; }
    }
  }, [isInView, isMobile]);

  // First 3 images get priority (above-the-fold), rest are lazy
  const isAboveFold = index < 3;

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      className="break-inside-avoid pb-6"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link
        href={`/portfolio/${project._id}`}
        className="group block relative"
        onMouseEnter={(e) => {
          const v = e.currentTarget.querySelector('video');
          if (v) {
            v.muted = isMuted;
            v.play().catch(() => { v.muted = true; setIsMuted(true); v.play().catch(() => {}); });
          }
        }}
        onMouseLeave={(e) => {
          if (isMobile) return;
          const v = e.currentTarget.querySelector('video');
          if (v) { v.pause(); v.currentTime = 0; }
        }}
      >
        <div className={`relative overflow-hidden bg-[var(--card)] rounded-[2rem] border border-[var(--border)] mb-4 transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-orange-500/10 ${isMobile && hovered ? 'border-white/20 shadow-2xl shadow-orange-500/10' : ''}`}>

          {/* Cover Image */}
          <div className={`transition-opacity duration-700 ${hovered && (hoverVideoSrc || hasMultipleImages) ? 'opacity-0' : 'opacity-100'}`}>
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt={project.title}
                width={600}
                height={450}
                // Correct responsive sizes for the 3-column masonry layout
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={isAboveFold}           // LCP boost for first 3 cards
                fetchPriority={isAboveFold ? 'high' : 'low'}
                onContextMenu={e => e.preventDefault()}
                draggable={false}
                className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-700 ease-out select-none"
              />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center text-[var(--muted)] uppercase tracking-widest text-xs font-bold glass-light">
                <FiLayers size={24} />
              </div>
            )}
          </div>

          {/* Hover Video (Cloudinary direct only — youtube embeds won't hover-play) */}
          {hoverVideoSrc && (
            <video
              src={hoverVideoSrc}
              muted playsInline loop preload="none"
              controlsList="nodownload noremoteplayback"
              onContextMenu={e => e.preventDefault()}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out z-0 pointer-events-none select-none ${hovered ? 'opacity-100 scale-105' : 'opacity-0'}`}
            />
          )}

          {/* Multi-image slideshow on hover */}
          {!hoverVideoSrc && hasMultipleImages && (
            <div className={`absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
              <motion.div
                className="flex w-full h-full"
                animate={hovered ? { x: `-${(uniqueImages.length - 1) * 100}%` } : { x: 0 }}
                transition={{ duration: uniqueImages.length * 1.5, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
              >
                {uniqueImages.map((imgUrl, i) => (
                  <div key={i} className="relative w-full h-full shrink-0">
                    <Image
                      src={imgUrl}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      onContextMenu={e => e.preventDefault()}
                      draggable={false}
                      className="object-cover select-none"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Category badge */}
          {project.category && (
            <div className="absolute top-4 left-4 z-10">
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card backdrop-blur-md bg-black/50 text-white border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
              >
                {project.category.name}
              </motion.span>
            </div>
          )}

          {/* Project number */}
          <div className="absolute top-4 right-4 z-10">
            <span className="text-[10px] font-black text-white/30 tracking-widest">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent transition-opacity duration-500 flex flex-col justify-end p-6 z-10 ${hovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
            <span className={`text-white flex items-center gap-2 font-bold tracking-widest text-xs uppercase transition-transform duration-500 ${hovered ? 'translate-y-0' : 'translate-y-4'} group-hover:translate-y-0`}>
              View project <FiExternalLink size={12} />
            </span>
          </div>

          {/* Mute toggle */}
          {hoverVideoSrc && (
            <div className={`absolute bottom-6 right-6 z-30 transition-opacity duration-500 pointer-events-none flex gap-2 ${hovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
              <button
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  setIsMuted(!isMuted);
                  const v = e.currentTarget.closest('.group')?.querySelector('video');
                  if (v) v.muted = !isMuted;
                }}
                className="p-2.5 bg-black/40 text-white rounded-full backdrop-blur-md hover:bg-black/80 transition-colors pointer-events-auto shadow-lg"
              >
                {isMuted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
              </button>
            </div>
          )}

          {/* Shimmer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          </div>
        </div>

        <div className="px-2">
          <h3 className="font-bold text-xl tracking-tight text-white mb-1 group-hover:text-orange-400 transition-colors duration-300">
            {project.title}
          </h3>
          <p className="text-[var(--muted)] text-sm line-clamp-2 font-light leading-relaxed">
            {project.shortDescription || project.description}
          </p>
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {project.tags.slice(0, 3).map((tag: string) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)]">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function PortfolioPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [projects, setProjects]     = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    // Parallel fetch — categories and projects load simultaneously
    Promise.all([
      api('/api/categories').then(r => r.json()),
      api('/api/projects').then(r => r.json()),
    ]).then(([cats, projs]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setProjects(Array.isArray(projs) ? projs : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Memoized filter — avoids recalculating on every render
  const filtered = useMemo(
    () => activeCategory === 'all'
      ? projects
      : projects.filter(p => p.category?._id === activeCategory || p.category?.slug === activeCategory),
    [projects, activeCategory]
  );

  return (
    <div className="site-container section-pad">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16 pt-16"
      >
        <p className="inline-block px-4 py-1.5 rounded-full glass-card text-[var(--muted)] text-xs font-semibold tracking-widest uppercase mb-6">
          My Work
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          Port
          <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            folio
          </span>
        </h1>
        <p className="text-[var(--muted)] max-w-xl mx-auto font-light text-xl">
          Browse through my design, video & security projects.
        </p>
      </motion.div>

      <Marquee />

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3 mb-20"
      >
        {[{ _id: 'all', name: 'All' }, ...categories].map((cat) => {
          const isActive = activeCategory === cat._id;
          return (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className="relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 overflow-hidden"
            >
              {isActive && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-black' : 'text-[var(--muted)] hover:text-white'}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Grid — shows skeletons while loading, real cards after */}
      {loading ? (
        // ── Skeleton Grid: 6 placeholder cards in masonry layout ──
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 border border-[var(--border)] rounded-3xl"
        >
          <p className="text-[var(--muted)] uppercase tracking-widest text-sm">
            No projects in this category.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            // Stagger cards for a smooth cascade reveal
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } } }}
            className="columns-1 sm:columns-2 lg:columns-3 gap-6"
          >
            {filtered.map((project, i) => (
              <ProjectCard key={project._id} project={project} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
