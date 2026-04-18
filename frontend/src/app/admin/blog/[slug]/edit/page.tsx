'use client';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiArrowLeft, FiSave, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug: currentSlug } = use(params);
  
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', coverImage: '', tags: '', isPublished: false });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const generateSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  useEffect(() => {
    api(`/api/blog/${currentSlug}`)
      .then(r => r.json())
      .then(d => {
        if (d._id) {
          setForm({
            title: d.title || '',
            slug: d.slug || '',
            excerpt: d.excerpt || '',
            content: d.content || '',
            coverImage: d.coverImage || '',
            tags: d.tags?.join(', ') || '',
            isPublished: d.isPublished || false
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentSlug]);

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file); fd.append('folder', 'portfolio/blog'); fd.append('resourceType', 'image');
    const res = await api('/api/upload', { method: 'POST', body: fd });
    if (res.ok) { const d = await res.json(); setForm(p => ({ ...p, coverImage: d.url })); toast.success('Cover uploaded!'); }
    else toast.error('Upload failed');
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return toast.error('Title and content required');
    setSaving(true);
    const res = await api(`/api/blog/${currentSlug}`, {
      method: 'PUT',
      json: { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) },
    });
    if (res.ok) { toast.success('Post updated!'); router.push('/admin/blog'); }
    else toast.error('Error updating post');
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/blog')} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"><FiArrowLeft /></button>
        <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Post title" className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Excerpt</label>
              <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2}
                placeholder="Short summary shown in blog list"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Content * (HTML supported)</label>
              <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={16}
                placeholder="Write your blog post content here... HTML is supported."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none font-mono" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Settings</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                placeholder="design, tips, branding"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Cover Image</label>
              {form.coverImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <Image src={form.coverImage} alt="cover" fill className="object-cover" />
                  <button onClick={() => setForm(p => ({ ...p, coverImage: '' }))} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white"><FiX size={12} /></button>
                </div>
              ) : (
                <button onClick={() => coverInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-500 transition-all">
                  <FiUpload /><span className="text-xs">{uploading ? 'Uploading...' : 'Upload cover'}</span>
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={uploadCover} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-all ${form.isPublished ? 'bg-orange-500' : 'bg-gray-700'} relative`}
                onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isPublished ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-gray-300">Published</span>
            </label>
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Update Post</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
