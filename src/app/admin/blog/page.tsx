'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiPlus, FiTrash2, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    setLoading(true);
    fetch('/api/blog?all=true').then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(fetchPosts, []);

  const togglePublish = async (post: any) => {
    await fetch(`/api/blog/${post.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, isPublished: !post.isPublished, publishedAt: !post.isPublished ? new Date() : post.publishedAt }),
    });
    fetchPosts();
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this blog post?')) return;
    await fetch(`/api/blog/${slug}`, { method: 'DELETE' });
    toast.success('Deleted'); fetchPosts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400 text-sm">{posts.length} articles</p>
        </div>
        <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold">
          <FiPlus /> New Post
        </Link>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">✍️</div>
              <p className="text-gray-400 mb-4">No blog posts yet</p>
              <Link href="/admin/blog/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold">
                <FiPlus /> Write First Post
              </Link>
            </div>
          ) : posts.map(post => (
            <div key={post._id} className="flex items-center gap-4 p-4 bg-[#111] border border-gray-800 rounded-xl">
              {post.coverImage && (
                <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={post.coverImage} alt={post.title} width={64} height={48} className="object-cover w-full h-full" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{post.title}</div>
                <div className="text-gray-500 text-xs mt-0.5 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${post.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {post.isPublished ? 'Published' : 'Draft'}
                  </span>
                  {post.tags?.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-gray-500">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/admin/blog/${post.slug}/edit`} className="p-2 rounded-lg bg-gray-800 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400"><FiEdit size={14} /></Link>
                <button onClick={() => togglePublish(post)} className="p-2 rounded-lg bg-gray-800 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400">
                  {post.isPublished ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
                <button onClick={() => handleDelete(post.slug)} className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400"><FiTrash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
