'use client';
import { use, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiTag, FiUser, FiCalendar, FiExternalLink } from 'react-icons/fi';

/* ─── Word-by-word title animation ──────────────────────────── */
function AnimatedTitle({ text }: { text: string }) {
  const words = text.split(' ');
  return (
    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.25em]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // unwrap async params for Next.js 15+
  const { id } = use(params as any) as { id: string };

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then(d => { setProject(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!project || project.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😔</div>
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link href="/portfolio" className="text-orange-400 hover:underline">← Back to Portfolio</Link>
      </div>
    );
  }

  const galleryItems = project.gallery?.length ? project.gallery : (project.images?.map((img: string) => ({ url: img, type: 'image' })) || []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">

      {/* ── Back button ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-orange-400 transition-colors mb-12 group text-sm font-medium"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          Back to Portfolio
        </Link>
      </motion.div>

      {/* ── Hero image — clip-path wipe reveal ── */}
      {project.coverImage && (
        <motion.div
          initial={{ clipPath: 'inset(100% 0 0 0)', opacity: 1 }}
          animate={{ clipPath: 'inset(0% 0 0 0)', opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden mb-12 border border-[var(--border)] shadow-2xl shadow-black/40 flex justify-center bg-black/20"
        >
          <Image src={project.coverImage} alt={project.title} width={1200} height={800} priority className="w-full h-auto" onContextMenu={(e) => e.preventDefault()} draggable={false} />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── Main Content ── */}
        <div className="lg:col-span-2">

          {/* Category tag */}
          {project.category && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full mb-5"
            >
              <FiTag size={10} /> {project.category.name}
            </motion.span>
          )}

          {/* Animated title */}
          <AnimatedTitle text={project.title} />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-[var(--muted)] text-lg leading-relaxed mb-10"
          >
            {project.description}
          </motion.p>

          {/* Video */}
          {project.videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-10"
            >
              <h3 className="font-bold text-lg mb-4">Project Video</h3>
              <div className="relative rounded-2xl overflow-hidden bg-black border border-[var(--border)] flex justify-center">
                <video src={project.videoUrl} preload="none" controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full h-auto max-h-[85vh] object-contain" />
              </div>
            </motion.div>
          )}

          {/* Google Drive */}
          {project.googleDriveLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-10"
            >
              <a
                href={project.googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card hover:bg-white/10 transition-colors border border-white/10 text-white font-medium shadow-lg shadow-black/20"
              >
                <span className="text-orange-500">📁</span> View High-Res Media on Google Drive
                <FiExternalLink size={14} />
              </a>
            </motion.div>
          )}

          {/* Image Gallery */}
          {galleryItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              <h3 className="font-bold text-lg mb-5">Gallery</h3>
              <div className="grid grid-cols-1 gap-10">
                {galleryItems.map((item: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.65 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative rounded-2xl overflow-hidden border border-[var(--border)] bg-black flex justify-center"
                  >
                    {item.type === 'video' ? (
                      <video src={item.url} preload="none" controls controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} className="w-full h-auto max-h-[85vh] object-contain" />
                    ) : (
                      <Image
                        src={item.url}
                        alt={`${project.title} gallery ${i + 1}`}
                        width={800}
                        height={600}
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        className="w-full h-auto"
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          {/* Project info card */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <h3 className="font-bold mb-5 text-sm uppercase tracking-widest text-[var(--muted)]">Project Info</h3>
            <dl className="space-y-4">
              {project.client && (
                <div className="flex items-start gap-3">
                  <FiUser size={14} className="text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[var(--muted)] text-xs uppercase tracking-wider mb-0.5">Client</dt>
                    <dd className="font-semibold text-sm">{project.client}</dd>
                  </div>
                </div>
              )}
              {project.category && (
                <div className="flex items-start gap-3">
                  <FiTag size={14} className="text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[var(--muted)] text-xs uppercase tracking-wider mb-0.5">Category</dt>
                    <dd className="font-semibold text-sm">{project.category.name}</dd>
                  </div>
                </div>
              )}
              {project.createdAt && (
                <div className="flex items-start gap-3">
                  <FiCalendar size={14} className="text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <dt className="text-[var(--muted)] text-xs uppercase tracking-wider mb-0.5">Year</dt>
                    <dd className="font-semibold text-sm">{new Date(project.createdAt).getFullYear()}</dd>
                  </div>
                </div>
              )}
              {project.tags?.length > 0 && (
                <div>
                  <dt className="text-[var(--muted)] text-xs uppercase tracking-wider mb-2">Tags</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-0.5 rounded-full border border-[var(--border)] text-[var(--muted)] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* CTA card */}
          <div className="bg-gradient-to-br from-orange-500/15 to-pink-500/10 border border-orange-500/20 rounded-2xl p-6 text-center">
            <p className="font-semibold mb-2">Like this project?</p>
            <p className="text-[var(--muted)] text-sm mb-5 leading-relaxed">
              Let's create something amazing for your brand.
            </p>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5"
            >
              Start a Project
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
