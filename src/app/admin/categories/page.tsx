'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit, FiSave, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = () => {
    setLoading(true);
    fetch('/api/categories').then(r => r.json()).then(d => { setCategories(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(fetchCategories, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleSave = async () => {
    if (!form.name) return toast.error('Name is required');
    const slugToUse = form.slug || generateSlug(form.name);
    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, slug: slugToUse }) });
      if (res.ok) {
        toast.success(editingId ? 'Category updated!' : 'Category created!');
        setShowForm(false);
        setEditingId(null);
        setForm({ name: '', slug: '', description: '' });
        fetchCategories();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Error saving');
      }
    } catch { toast.error('Server error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    fetchCategories();
  };

  const startEdit = (cat: any) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setEditingId(cat._id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">Manage portfolio categories</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', slug: '', description: '' }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90">
          <FiPlus /> Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-gray-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-white">{editingId ? 'Edit Category' : 'New Category'}</h3>
            <button onClick={() => setShowForm(false)}><FiX className="text-gray-400 hover:text-white" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: generateSlug(e.target.value) }))}
                placeholder="e.g. Graphic Design"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug</label>
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                placeholder="auto-generated"
                className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold">
            <FiSave /> Save Category
          </button>
        </motion.div>
      )}

      {/* List */}
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="space-y-3">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No categories yet. Create your first one!</div>
          ) : categories.map(cat => (
            <div key={cat._id} className="flex items-center justify-between p-4 bg-[#111] border border-gray-800 rounded-xl hover:border-orange-500/30 transition-all">
              <div>
                <div className="font-medium text-white">{cat.name}</div>
                <div className="text-gray-500 text-xs mt-0.5">/{cat.slug}</div>
                {cat.description && <div className="text-gray-400 text-xs mt-1">{cat.description}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(cat)} className="p-2 rounded-lg bg-gray-800 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400 transition-all">
                  <FiEdit size={15} />
                </button>
                <button onClick={() => handleDelete(cat._id)} className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
