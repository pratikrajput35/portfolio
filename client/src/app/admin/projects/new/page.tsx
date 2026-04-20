'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiSave, FiX, FiUpload, FiYoutube, FiLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import VideoEmbed, { detectVideoProvider } from '@/components/VideoEmbed';
import ThumbnailPicker from '@/components/admin/ThumbnailPicker';

// ─── Types ────────────────────────────────────────────────────────────────────
type VideoProvider = 'youtube' | 'drive' | null;

const EMPTY_FORM = {
  title: '', slug: '', shortDescription: '', description: '',
  category: '', client: '', tags: '', isFeatured: false, isPublished: true, order: 0,
  coverImage: '', images: [] as string[],
  gallery: [] as { url: string; type: 'image' | 'video' }[],
  videoUrl: '', videoProvider: null as VideoProvider,
};

// ─── Slug helper ──────────────────────────────────────────────────────────────
const generateSlug = (s: string) =>
  s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectFormPage() {
  const router   = useRouter();
  const params   = useParams();
  const isEdit   = Boolean(params?.id && params.id !== 'new');
  const projectId = params?.id as string | undefined;

  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [categories, setCats]   = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [videoInput, setVideoInput] = useState('');   // raw URL being typed
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat]   = useState(false);

  const galleryRef = useRef<HTMLInputElement>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    api('/api/categories').then(r => r.json()).then(d => setCats(Array.isArray(d) ? d : []));

    if (isEdit && projectId) {
      api(`/api/projects/${projectId}`).then(r => r.json()).then(proj => {
        if (!proj._id) return;
        setForm({
          title:            proj.title || '',
          slug:             proj.slug  || '',
          shortDescription: proj.shortDescription || '',
          description:      proj.description || '',
          category:         proj.category?._id || proj.category || '',
          client:           proj.client || '',
          tags:             proj.tags?.join(', ') || '',
          isFeatured:       proj.isFeatured  || false,
          isPublished:      proj.isPublished ?? true,
          order:            proj.order || 0,
          coverImage:       proj.coverImage || '',
          images:           proj.images || [],
          gallery:          proj.gallery?.length
                              ? proj.gallery
                              : (proj.images?.map((u: string) => ({ url: u, type: 'image' })) || []),
          videoUrl:         proj.videoUrl || '',
          videoProvider:    proj.videoProvider || detectVideoProvider(proj.videoUrl || '') || null,
        });
        setVideoInput(proj.videoUrl || '');
      });
    }
  }, [isEdit, projectId]);

  // ── Upload file to Cloudinary ──────────────────────────────────────────────
  const uploadFile = async (file: File, folder = 'portfolio'): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    fd.append('resourceType', file.type.startsWith('video') ? 'video' : 'image');
    const res = await api('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) return null;
    return (await res.json()).url;
  };

  // ── Thumbnail upload wrapper ───────────────────────────────────────────────
  const handleThumbnailUpload = async (file: File): Promise<string | null> => {
    setUploading(true);
    const url = await uploadFile(file);
    setUploading(false);
    if (!url) { toast.error('Upload failed. Check Cloudinary config.'); return null; }
    return url;
  };

  // ── Gallery upload ─────────────────────────────────────────────────────────
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const results = await Promise.all(
      files.map(async f => {
        const url = await uploadFile(f);
        return url ? { url, type: f.type.startsWith('video') ? 'video' : 'image' } : null;
      })
    );
    const valid = results.filter(Boolean) as { url: string; type: 'image' | 'video' }[];
    setForm(p => ({ ...p, gallery: [...p.gallery, ...valid] }));
    if (valid.length) toast.success(`${valid.length} file(s) uploaded!`);
    else toast.error('All uploads failed.');
    setUploading(false);
    e.target.value = '';
  };

  // ── Apply video URL ────────────────────────────────────────────────────────
  const applyVideoUrl = (raw: string) => {
    const url = raw.trim();
    const provider = detectVideoProvider(url);
    
    // Extract ID if YouTube to suggest a thumbnail
    let suggestedCover = '';
    if (provider === 'youtube') {
      const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([a-zA-Z0-9_-]+)/);
      if (match) {
        suggestedCover = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }

    setForm(p => ({ 
      ...p, 
      videoUrl: url, 
      videoProvider: provider,
      // Auto-fill cover image if currently empty
      coverImage: !p.coverImage && suggestedCover ? suggestedCover : p.coverImage
    }));
  };

  // ── Create category ────────────────────────────────────────────────────────
  const handleCreateCat = async () => {
    if (!newCatName.trim()) return;
    const tid = toast.loading('Creating...');
    try {
      const res = await api('/api/categories', {
        method: 'POST',
        json: { name: newCatName.trim(), slug: generateSlug(newCatName), description: '' },
      });
      if (res.ok) {
        const cat = await res.json();
        setCats(c => [...c, cat]);
        setForm(p => ({ ...p, category: cat._id }));
        setAddingCat(false);
        setNewCatName('');
        toast.success('Category created!', { id: tid });
      } else {
        toast.error('Failed', { id: tid });
      }
    } catch {
      toast.error('Error', { id: tid });
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title)       return toast.error('Title is required');
    if (!form.description) return toast.error('Description is required');
    if (!form.category)    return toast.error('Select a category');
    if (!form.coverImage)  return toast.error('Cover / thumbnail image is required');

    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.title),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: form.gallery.filter(g => g.type === 'image').map(g => g.url),
    };

    const url    = isEdit ? `/api/projects/${projectId}` : '/api/projects';
    const method = isEdit ? 'PUT' : 'POST';
    const res    = await api(url, { method, json: payload });

    if (res.ok) {
      toast.success(isEdit ? 'Project updated!' : 'Project created!');
      router.push('/admin/projects');
    } else {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || 'Error saving project');
    }
    setSaving(false);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/projects')} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-all">
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Project' : 'New Project'}</h1>
          <p className="text-gray-500 text-sm">Fill in all required fields (*) to save</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left/Main column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Basic Info</h3>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Title <span className="text-red-400">*</span></label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: generateSlug(e.target.value) }))}
                placeholder="Project title"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Short Description</label>
              <input
                value={form.shortDescription}
                onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                placeholder="One-liner for project cards"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Description <span className="text-red-400">*</span></label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={5}
                placeholder="Detailed project description..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Client</label>
                <input
                  value={form.client}
                  onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
                  placeholder="Client name (optional)"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tags (comma separated)</label>
                <input
                  value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))}
                  placeholder="logo, branding, print"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Video ── */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Video (Optional)</h3>
              {form.videoUrl && (
                <button
                  type="button"
                  onClick={() => { setForm(p => ({ ...p, videoUrl: '', videoProvider: null })); setVideoInput(''); }}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <FiX size={12} /> Remove
                </button>
              )}
            </div>

            {/* URL input */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1.5">
                <FiLink size={11} /> Paste YouTube or Google Drive URL
              </label>
              <div className="flex gap-2">
                <input
                  value={videoInput}
                  onChange={e => {
                    setVideoInput(e.target.value);
                    if (e.target.value.trim()) applyVideoUrl(e.target.value);
                  }}
                  placeholder="https://youtube.com/watch?v=... or https://drive.google.com/file/d/..."
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => applyVideoUrl(videoInput)}
                  className="px-4 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium hover:bg-orange-500/20 transition-all whitespace-nowrap"
                >
                  Apply
                </button>
              </div>

              {/* Provider badge */}
              {form.videoProvider && (
                <div className="mt-2 flex items-center gap-1.5">
                  {form.videoProvider === 'youtube' ? (
                    <span className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FiYoutube size={10} /> YouTube detected ✓
                    </span>
                  ) : (
                    <span className="text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                      📁 Google Drive detected ✓
                    </span>
                  )}
                </div>
              )}
            </div>

              {/* Live embed preview */}
              {form.videoUrl && form.videoProvider && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <VideoEmbed url={form.videoUrl} provider={form.videoProvider} className="border border-gray-800" />
                  </div>

                  {/* Integrated Thumbnail Picker — now inside the video box for better focus */}
                  <div className="pt-4 border-t border-gray-800/50">
                    <ThumbnailPicker
                      videoUrl={form.videoUrl}
                      provider={form.videoProvider}
                      current={form.coverImage}
                      onChange={url => setForm(p => ({ ...p, coverImage: url }))}
                      onUpload={handleThumbnailUpload}
                      uploading={uploading}
                    />
                  </div>
                </div>
              )}
            </div>

          {/* Fallback Thumbnail Picker for and Google Drive/Static projects (when no YouTube preview is active) */}
          {(!form.videoUrl || form.videoProvider !== 'youtube') && (
            <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
              <ThumbnailPicker
                videoUrl={form.videoUrl}
                provider={form.videoProvider}
                current={form.coverImage}
                onChange={url => setForm(p => ({ ...p, coverImage: url }))}
                onUpload={handleThumbnailUpload}
                uploading={uploading}
              />
            </div>
          )}

          {/* ── Gallery ── */}
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-3">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Gallery Images</h3>
            <p className="text-xs text-gray-500">Additional images shown on the project detail page. Upload high-res images — they will be auto-compressed.</p>

            {form.gallery.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {form.gallery.map((item, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-black border border-gray-800 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.url} alt={`gallery-${i}`} className="w-full h-full object-cover" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, gallery: p.gallery.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={uploading}
              className="w-full py-3 border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm hover:border-orange-500/60 hover:text-orange-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FiUpload size={15} />
              {uploading ? 'Uploading...' : `${form.gallery.length > 0 ? 'Add more' : '+ Add'} gallery images`}
            </button>
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
          </div>

        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4 lg:sticky lg:top-6">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Settings</h3>

            {/* Category */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-400">Category <span className="text-red-400">*</span></label>
                {!addingCat && (
                  <button type="button" onClick={() => setAddingCat(true)} className="text-orange-500 text-xs hover:underline">
                    + New
                  </button>
                )}
              </div>
              {addingCat ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Category name"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                    onKeyDown={e => e.key === 'Enter' && handleCreateCat()}
                  />
                  <button type="button" onClick={handleCreateCat} disabled={!newCatName.trim()} className="px-3 bg-orange-500 text-white text-sm rounded-xl disabled:opacity-50">Add</button>
                  <button type="button" onClick={() => { setAddingCat(false); setNewCatName(''); }} className="px-3 bg-gray-700 text-gray-300 text-sm rounded-xl">✕</button>
                </div>
              ) : (
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              )}
            </div>

            {/* Toggles */}
            {([['isPublished', 'Published'], ['isFeatured', 'Featured on Home']] as const).map(([field, label]) => (
              <label key={field} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-300">{label}</span>
                <div
                  className={`w-10 h-6 rounded-full transition-all relative ${(form as any)[field] ? 'bg-orange-500' : 'bg-gray-700'}`}
                  onClick={() => setForm(p => ({ ...p, [field]: !(p as any)[field] }))}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${(form as any)[field] ? 'left-5' : 'left-1'}`} />
                </div>
              </label>
            ))}

            {/* Order */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Display Order</label>
              <input
                type="number"
                value={form.order}
                onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none"
              />
              <p className="text-[10px] text-gray-600 mt-1">Lower = appears first (0 is first)</p>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-bg text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                : <><FiSave /> {isEdit ? 'Update Project' : 'Create Project'}</>
              }
            </button>

            {/* Tips */}
            <div className="pt-2 border-t border-gray-800 space-y-1.5">
              <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wider">Best Practices</p>
              <p className="text-[11px] text-gray-600">📹 Use YouTube for videos — saves Cloudinary storage completely</p>
              <p className="text-[11px] text-gray-600">🖼️ Images are auto-compressed to 1280px max width</p>
              <p className="text-[11px] text-gray-600">🎬 YouTube thumbnails are free to use — no upload needed</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
