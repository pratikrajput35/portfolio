'use client';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
  type Variants,
} from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiExternalLink, FiVolume2, FiVolumeX } from 'react-icons/fi';
import api from '@/lib/api';

/* ─── Animation Variants ─────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

/* ─── 3-D Tilt Card ──────────────────────────────────────────── */
function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    x.set((e.clientX - left) / width - 0.5);
    y.set((e.clientY - top) / height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Tag Badge ──────────────────────────────────────────────── */
function CategoryBadge({ name }: { name: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card backdrop-blur-md bg-black/50 border border-white/10 text-white px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
    >
      {name}
    </motion.span>
  );
}

/* ─── Featured Project Card ──────────────────────────────────── */
function FeaturedProjectCard({ project }: { project: any }) {
  const [hovered, setHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const galleryVideos = project.gallery?.filter((g: any) => g.type === 'video') || [];
  const hoverVideoSrc = project.videoUrl || (galleryVideos.length > 0 ? galleryVideos[0].url : null);
  
  const allImages = [
    project.coverImage,
    ...(project.gallery?.filter((g: any) => g.type === 'image').map((g: any) => g.url) || []),
    ...(project.images || [])
  ].filter(Boolean);
  const uniqueImages = Array.from(new Set(allImages));
  const hasMultipleImages = uniqueImages.length > 1;

  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { amount: 0.6, margin: "0px 0px -10% 0px" });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    if (isInView) {
      setHovered(true);
      const v = cardRef.current?.querySelector('video');
      if (v) { v.muted = true; setIsMuted(true); v.play().catch(() => {}); }
    } else {
      setHovered(false);
      const v = cardRef.current?.querySelector('video');
      if (v) { v.pause(); v.currentTime = 0; }
    }
  }, [isInView, isMobile]);

  return (
    <motion.div ref={cardRef} variants={cardVariants} className="break-inside-avoid pb-10" onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}>
      <TiltCard>
        <Link href={`/portfolio/${project._id}`} className="group block relative"
          onMouseEnter={(e) => { 
            const v = e.currentTarget.querySelector('video'); 
             if (v) { 
               v.muted = isMuted; 
               v.play().catch((err) => { 
                  console.warn('Autoplay blocked with sound, attempting muted', err);
                  v.muted = true;
                  setIsMuted(true);
                  v.play().catch(()=>{});
               }); 
             } 
          }}
          onMouseLeave={(e) => { 
            if (isMobile) return;
            const v = e.currentTarget.querySelector('video'); 
            if (v) { v.pause(); v.currentTime = 0; } 
          }}
        >
          <div className={`relative overflow-hidden bg-[var(--card)] rounded-[2rem] border border-[var(--border)] mb-6 transition-all duration-500 hover:border-white/20 hover:shadow-2xl hover:shadow-orange-500/10 ${isMobile && hovered ? 'border-white/20 shadow-2xl shadow-orange-500/10' : ''}`}>
            
            {/* Main Cover Image */}
            <div className={`transition-opacity duration-700 ${hovered && (hoverVideoSrc || hasMultipleImages) ? 'opacity-0' : 'opacity-100'}`}>
              {project.coverImage ? (
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  width={600}
                  height={450}
                  onContextMenu={(e) => e.preventDefault()}
                  draggable={false}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                />
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center text-[var(--muted)] text-sm tracking-widest uppercase glass-light">
                  Media
                </div>
              )}
            </div>

            {/* Hover Video */}
            {hoverVideoSrc && (
              <video
                src={hoverVideoSrc}
                muted playsInline loop preload="none"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out z-0 pointer-events-none ${hovered ? 'opacity-100 scale-105' : 'opacity-0'}`}
              />
            )}

            {/* Hover Multiple Images Scroll */}
            {!hoverVideoSrc && hasMultipleImages && (
              <div className={`absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
                <motion.div
                  className="flex w-full h-full"
                  animate={hovered ? { x: `-${(uniqueImages.length - 1) * 100}%` } : { x: 0 }}
                  transition={{ duration: uniqueImages.length * 1.5, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
                >
                  {uniqueImages.map((imgUrl, i) => (
                    <div key={i} className="relative w-full h-full shrink-0">
                      <Image src={imgUrl as string} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" onContextMenu={(e) => e.preventDefault()} draggable={false} className="object-cover" />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {project.category && (
              <div className="absolute top-5 left-5 z-10">
                <CategoryBadge name={project.category.name} />
              </div>
            )}

            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-500 flex flex-col justify-end p-8 z-10 ${hovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
              <motion.span className="text-white flex items-center gap-2 font-bold tracking-widest text-sm uppercase" initial={{ y: 20, opacity: 0 }} animate={{ y: hovered ? 0 : 20, opacity: hovered ? 1 : 0 }} whileHover={{ y: 0, opacity: 1 }}>
                View case study <FiArrowRight />
              </motion.span>
            </div>
            
            {hoverVideoSrc && (
               <div className={`absolute bottom-6 right-6 z-30 transition-opacity duration-500 pointer-events-none flex gap-2 ${hovered ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
                 <button 
                   onClick={(e) => { 
                     e.preventDefault(); 
                     e.stopPropagation(); 
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

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
            </div>
          </div>

          <div className="px-2">
            <h3 className="text-2xl font-bold tracking-tight text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">
              {project.title}
            </h3>
            <p className="text-[var(--muted)] text-sm line-clamp-2 font-light leading-relaxed">
              {project.shortDescription || project.description}
            </p>
            {project.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.tags.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-[10px] px-2.5 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Link>
      </TiltCard>
    </motion.div>
  );
}

/* ─── Main Section ───────────────────────────────────────────── */
export default function FeaturedProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const headingY = useTransform(scrollYProgress, [0, 0.3], [20, -20]);
  const headingOpacity = useTransform(scrollYProgress, [0, 0.05, 0.4, 0.6], [0, 1, 1, 0.6]);

  useEffect(() => {
    api('/api/projects?featured=true&limit=6')
      .then((r) => r.json())
      .then((res) => {
        // API returns { data: [...], total, page } when limit param is used
        const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
        setProjects(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="site-container section-pad">
        <div className="flex flex-col items-center text-center mb-24 opacity-20">
           <div className="h-4 w-32 bg-white/10 rounded-full mb-6 animate-pulse" />
           <div className="h-16 w-64 bg-white/10 rounded-xl mb-6 animate-pulse" />
        </div>
        <div className="columns-1 md:columns-2 gap-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="break-inside-avoid pb-10">
              <div className="aspect-[4/3] w-full bg-white/5 rounded-[2rem] border border-white/10 animate-pulse" />
              <div className="mt-6 px-2 space-y-3">
                <div className="h-7 w-2/3 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-4 w-full bg-white/5 rounded-lg animate-pulse" />
                <div className="h-4 w-1/2 bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="site-container section-pad overflow-hidden">

      {/* ── Heading (scroll-parallax) ── */}
      <motion.div
        style={{ y: headingY, opacity: headingOpacity }}
        className="flex flex-col items-center text-center mb-24"
      >
        <div className="max-w-2xl">
          <p className="inline-block px-4 py-1.5 rounded-full glass-card text-[var(--muted)] text-xs font-semibold tracking-widest uppercase mb-6">
            Selected Work
          </p>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Featured{' '}
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
              Projects
            </span>
          </h2>
          <p className="text-[var(--muted)] font-light text-lg mb-8 max-w-xl mx-auto">
            A curated selection of my best design, video, and security work.
          </p>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white hover:text-orange-400 transition-colors bg-white/5 px-6 py-3 rounded-full hover:bg-white/10 border border-white/10"
          >
            Explore All <FiArrowRight />
          </Link>
        </div>
      </motion.div>

      {/* ── Empty State ── */}
      {projects.length === 0 && (
        <div className="text-center py-24 border border-[var(--border)] rounded-3xl bg-[var(--card)]">
          <p className="text-[var(--muted)] uppercase tracking-widest text-sm mb-4">
            No projects yet.
          </p>
          <Link
            href="/api/seed"
            target="_blank"
            className="mt-2 inline-block text-orange-400 border-b border-orange-500/30 pb-1 hover:border-orange-500 transition-colors text-sm font-medium"
          >
            Seed sample data →
          </Link>
        </div>
      )}

      {/* ── Cards Grid ── */}
      {projects.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="columns-1 md:columns-2 gap-10"
        >
          {projects.map((project) => (
            <FeaturedProjectCard key={project._id} project={project} />
          ))}
        </motion.div>
      )}
    </section>
  );
}
