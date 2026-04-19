'use client';
import { use } from 'react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiTag } from 'react-icons/fi';

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/api/blog/${slug}`)
      .then(r => r.json())
      .then(d => { setPost(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!post || post.error) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="text-6xl">😔</div>
      <h2 className="text-2xl font-bold">Post not found</h2>
      <Link href="/blog" className="text-orange-400 hover:underline">← Back to Blog</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/blog" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-orange-400 transition-colors mb-8 group">
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Blog
        </Link>
      </motion.div>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {post.tags?.map((tag: string) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
              <FiTag size={10} />{tag}
            </span>
          ))}
          {post.publishedAt && (
            <span className="text-[var(--muted)] text-xs flex items-center gap-1">
              <FiClock size={10} />
              {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{post.title}</h1>
        <p className="text-[var(--muted)] text-xl leading-relaxed mb-8">{post.excerpt}</p>

        {post.coverImage && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-10">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
          </div>
        )}

        <div
          className="prose prose-invert max-w-none prose-headings:font-bold prose-a:text-orange-400 prose-strong:text-[var(--foreground)]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.article>
    </div>
  );
}
