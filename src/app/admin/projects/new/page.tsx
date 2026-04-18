'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { FiUpload, FiArrowLeft, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  title: '', slug: '', shortDescription: '', description: '',
  category: '', client: '', tags: '', isFeatured: false, isPublished: true, order: 0,
  coverImage: '', images: [] as string[], gallery: [] as {url: string, type: 'image'|'video'}[], videoUrl: '', googleDriveLink: '',
};

interface ProjectFormPageProps {
  projectId?: string;
}

export default function ProjectFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params?.id && params.id !== 'new';
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [categories, setCategories] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    const toastId = toast.loading('Creating category...');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), slug: generateSlug(newCategoryName), description: '' })
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories([...categories, newCat]);
        setForm({ ...form, category: newCat._id });
        setIsAddingCategory(false);
        setNewCategoryName('');
        toast.success('Category created!', { id: toastId });
      } else {
        toast.error('Failed to create category', { id: toastId });
      }
    } catch {
      toast.error('Server error', { id: toastId });
    }
  };

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : []));
    if (isEdit) {
      fetch(`/api/projects/${params.id}`).then(r => r.json()).then(proj => {
        if (proj._id) {
          setForm({
            title: proj.title || '',
            slug: proj.slug || '',
            shortDescription: proj.shortDescription || '',
            description: proj.description || '',
            category: proj.category?._id || proj.category || '',
            client: proj.client || '',
            tags: proj.tags?.join(', ') || '',
            isFeatured: proj.isFeatured || false,
            isPublished: proj.isPublished ?? true,
            order: proj.order || 0,
            coverImage: proj.coverImage || '',
            images: proj.images || [],
            gallery: proj.gallery?.length ? proj.gallery : (proj.images?.map((img: string) => ({ url: img, type: 'image' })) || []),
            videoUrl: proj.videoUrl || '',
            googleDriveLink: proj.googleDriveLink || '',
          });
        }
      });
    }
  }, [isEdit, params?.id]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const uploadFile = async (file: File, folder = 'portfolio'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('resourceType', file.type.startsWith('video') ? 'video' : 'image');
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      setForm(p => ({ ...p, coverImage: url }));
      toast.success('Cover image uploaded!');
    } else {
      toast.error('Upload failed. Check Cloudinary config.');
    }
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
    const validResults = results.filter(r => r.url) as {url: string, type: 'video' | 'image'}[];
    setForm(p => ({ ...p, gallery: [...p.gallery, ...validResults] }));
    toast.success(`${validResults.length} item(s) uploaded!`);
    setUploading(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const toastId = toast.loading('Uploading video... This may take a moment.');
    const url = await uploadFile(file);
    if (url) {
      setForm(p => ({ ...p, videoUrl: url }));
      toast.success('Video uploaded successfully!', { id: toastId });
    } else {
      toast.error('Video upload failed.', { id: toastId });
    }
    setUploading(false);
  };

  const removeGalleryItem = (idx: number) => {
    setForm(p => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.title) return toast.error('Title is required');
    if (!form.description) return toast.error('Description is required');
    if (!form.category) return toast.error('Select a category');
    if (!form.coverImage) return toast.error('Cover image is required');

    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.title),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    const url = isEdit ? `/api/projects/${params.id}` : '/api/projects';
    const method = isEdit ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) {
      toast.success(isEdit ? 'Project updated!' : 'Project created!');
      router.push('/admin/projects');
    } else {
      const d = await res.json();
      toast.error(d.error || 'Error saving project');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/projects')} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-all">
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Project' : 'New Project'}</h1>
          <p className="text-gray-400 text-sm">Fill in the project details below</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main fields */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Basic Info</h3>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: generateSlug(e.target.value) }))}
                placeholder="Project title"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Short Description</label>
              <input value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                placeholder="Brief one-liner for cards"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={5} placeholder="Detailed project description..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Client</label>
                <input value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
                  placeholder="Client name (optional)"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="logo, branding, print"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Media</h3>
            {/* Cover */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Cover Image / Video Thumbnail * (Shown in portfolio grid)</label>
              {form.coverImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden mb-2">
                  <Image src={form.coverImage} alt="cover" fill className="object-cover" />
                  <button onClick={() => setForm(p => ({ ...p, coverImage: '' }))} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white">
                    <FiX size={13} />
                  </button>
                </div>
              ) : (
                <button onClick={() => coverInputRef.current?.click()} disabled={uploading}
                  className="w-full aspect-video border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-all">
                  <FiUpload size={24} />
                  <span className="text-sm">{uploading ? 'Uploading...' : 'Click to upload cover image'}</span>
                </button>
              )}
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Gallery Media</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {form.gallery.map((item, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-black border border-gray-800">
                    {item.type === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                    ) : (
                      <Image src={item.url} alt={`gallery-item-${i}`} fill className="object-cover" />
                    )}
                    <button onClick={() => removeGalleryItem(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10">
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => galleryInputRef.current?.click()} disabled={uploading}
                className="w-full py-2.5 border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm hover:border-orange-500 hover:text-orange-400 transition-all">
                {uploading ? 'Uploading...' : '+ Add gallery media (images/videos)'}
              </button>
              <input ref={galleryInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleGalleryUpload} />
            </div>

            {/* Video */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">Hover Preview Video (optional - Plays on hover in portfolio)</label>
                {form.videoUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-2 bg-black border border-gray-800">
                    <video src={form.videoUrl} controls className="w-full h-full object-contain" />
                    <button onClick={() => setForm(p => ({ ...p, videoUrl: '' }))} className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white z-10">
                      <FiX size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input value={form.videoUrl} onChange={e => setForm(p => ({ ...p, videoUrl: e.target.value }))}
                      placeholder="https://cloudinary.com/video/..."
                      className="flex-1 px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
                    <button type="button" onClick={() => videoInputRef.current?.click()} disabled={uploading}
                      className="px-4 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 whitespace-nowrap flex items-center gap-2">
                      <FiUpload size={16} /> {uploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-xs text-gray-400 mb-1">Google Drive Link (optional)</label>
                <input value={form.googleDriveLink} onChange={e => setForm(p => ({ ...p, googleDriveLink: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
                <p className="text-[10px] text-gray-500 mt-1">Provide an external link to Drive photos or videos for this project.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Settings</h3>
            {/* Category */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs text-gray-400">Category *</label>
                {!isAddingCategory && (
                  <button type="button" onClick={() => setIsAddingCategory(true)} className="text-orange-500 text-xs hover:underline font-medium">+ New Category</button>
                )}
              </div>
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <input autoFocus value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Graphic Design"
                    className="flex-1 px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
                  <button type="button" onClick={handleCreateCategory} disabled={!newCategoryName.trim()}
                    className="px-4 bg-white text-black text-sm rounded-xl font-medium disabled:opacity-50">Add</button>
                  <button type="button" onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); }}
                    className="px-3 bg-red-500/10 text-red-500 text-sm rounded-xl hover:bg-red-500/20">Cancel</button>
                </div>
              ) : (
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-all ${form.isPublished ? 'bg-orange-500' : 'bg-gray-700'} relative`} onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isPublished ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-gray-300">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-all ${form.isFeatured ? 'bg-orange-500' : 'bg-gray-700'} relative`} onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.isFeatured ? 'left-5' : 'left-1'}`} />
              </div>
              <span className="text-sm text-gray-300">Featured on Home</span>
            </label>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Display Order</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
              <p className="text-[10px] text-gray-500 mt-1">Lower numbers appear first (e.g. 0 is first, 1 is second).</p>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSave /> Save Project</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
