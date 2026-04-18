'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FiUpload, FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState<any>({
    title: '', slug: '', shortDescription: '', description: '',
    category: '', client: '', tags: '', isFeatured: false, isPublished: true,
    coverImage: '', images: [], gallery: [], videoUrl: '', googleDriveLink: '',
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      api('/api/categories').then(r => r.json()),
      api(`/api/projects/${id}`).then(r => r.json()),
    ]).then(([cats, proj]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      if (proj._id) {
        setForm({
          title: proj.title || '', slug: proj.slug || '',
          shortDescription: proj.shortDescription || '',
          description: proj.description || '',
          category: proj.category?._id || proj.category || '',
          client: proj.client || '',
          tags: proj.tags?.join(', ') || '',
          isFeatured: proj.isFeatured || false,
          isPublished: proj.isPublished ?? true,
          coverImage: proj.coverImage || '',
          images: proj.images || [],
          gallery: proj.gallery?.length ? proj.gallery : (proj.images?.map((img: string) => ({ url: img, type: 'image' })) || []),
          videoUrl: proj.videoUrl || '',
          googleDriveLink: proj.googleDriveLink || '',
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'portfolio');
    formData.append('resourceType', file.type.startsWith('video') ? 'video' : 'image');
    const res = await api('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) { setForm((p: any) => ({ ...p, coverImage: url })); toast.success('Cover uploaded!'); }
    else toast.error('Upload failed');
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const results = await Promise.all(
      files.map(async f => {
        const url = await uploadFile(f);
        return { url, type: f.type.startsWith('video') ? 'video' : 'image' };
      })
    );
    const valid = results.filter(r => r.url) as {url: string, type: 'video' | 'image'}[];
    setForm((p: any) => ({ ...p, gallery: [...p.gallery, ...valid] }));
    toast.success(`${valid.length} item(s) uploaded!`);
    setUploading(false);
  };

  const removeGalleryItem = (idx: number) => {
    setForm((p: any) => ({ ...p, gallery: p.gallery.filter((_: any, i: number) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.category || !form.coverImage)
      return toast.error('Please fill all required fields');
    setSaving(true);
    const res = await api(`/api/projects/${id}`, {
      method: 'PUT',
      json: { ...form, tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) },
    });
    if (res.ok) { toast.success('Project updated!'); router.push('/admin/projects'); }
    else toast.error('Error updating project');
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/projects')} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
          <FiArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-white">Edit Project</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Basic Info</h3>
            {['title', 'shortDescription', 'client'].map(field => (
              <div key={field}>
                <label className="block text-xs text-gray-400 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input value={form[field]} onChange={e => setForm((p: any) => ({ ...p, [field]: e.target.value }))}
                  placeholder={field}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))}
                rows={5} className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm((p: any) => ({ ...p, tags: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Media</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Cover Image</label>
              {form.coverImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <Image src={form.coverImage} alt="cover" fill className="object-cover" />
                  <button onClick={() => setForm((p: any) => ({ ...p, coverImage: '' }))} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white"><FiX size={12} /></button>
                </div>
              ) : (
                <button onClick={() => coverInputRef.current?.click()} className="w-full aspect-video border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-500 transition-all">
                  <FiUpload size={22} /><span className="text-sm">Upload cover</span>
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-2">Gallery Media</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {form.gallery.map((item: any, i: number) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-black border border-gray-800">
                    {item.type === 'video' ? (
                       <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                       <Image src={item.url} alt="" fill className="object-cover" />
                    )}
                    <button onClick={() => removeGalleryItem(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"><FiX size={10} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => galleryInputRef.current?.click()} className="w-full py-2 border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm hover:border-orange-500 transition-all">+ Add media (images/videos)</button>
              <input ref={galleryInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleGalleryUpload} />
            </div>
            
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Video (optional)</label>
                {form.videoUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-black border border-gray-800">
                    <video src={form.videoUrl} controls className="w-full h-full object-contain" />
                    <button onClick={() => setForm((p: any) => ({ ...p, videoUrl: '' }))} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white z-10"><FiX size={13} /></button>
                  </div>
                ) : (
                  <input value={form.videoUrl} onChange={e => setForm((p: any) => ({ ...p, videoUrl: e.target.value }))}
                    placeholder="https://cloudinary.com/video/..."
                    className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Settings</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none">
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            {[['isPublished', 'Published'], ['isFeatured', 'Featured']].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-6 rounded-full transition-all ${form[field] ? 'bg-orange-500' : 'bg-gray-700'} relative`}
                  onClick={() => setForm((p: any) => ({ ...p, [field]: !p[field] }))}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form[field] ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Update Project</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
