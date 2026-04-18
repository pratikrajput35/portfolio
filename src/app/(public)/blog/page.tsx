'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiTag } from 'react-icons/fi';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="site-container section-pad">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-3">Insights</p>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Blog</h1>
        <p className="text-[var(--muted)] max-w-xl mx-auto">Thoughts on design, creativity, and the creative process.</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-24 text-[var(--muted)]">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">✍️</div>
          <p className="text-[var(--muted)]">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <article className="group h-full flex flex-col bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300">
                  <div className="aspect-[16/9] relative overflow-hidden">
                    {post.coverImage ? (
                      <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full gradient-bg opacity-20 flex items-center justify-center text-4xl">✍️</div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    {post.tags?.length > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <FiTag size={12} className="text-orange-400" />
                        <span className="text-xs text-orange-400 font-medium">{post.tags[0]}</span>
                      </div>
                    )}
                    <h2 className="font-bold text-xl mb-2 group-hover:text-orange-400 transition-colors line-clamp-2">{post.title}</h2>
                    <p className="text-[var(--muted)] text-sm line-clamp-3 flex-1">{post.excerpt}</p>
                    <div className="flex items-center gap-2 mt-4 text-[var(--muted)] text-xs">
                      <FiClock size={12} />
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
