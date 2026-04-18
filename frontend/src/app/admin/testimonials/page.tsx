'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiEdit, FiSave, FiX, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const EMPTY = { name: '', role: '', company: '', content: '', rating: 5, isPublished: true };

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });

  const fetch_ = () => {
    setLoading(true);
    api('/api/testimonials').then(r => r.json()).then(d => { setTestimonials(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(fetch_, []);

  const handleSave = async () => {
    if (!form.name || !form.content) return toast.error('Name and content required');
    const url = editId ? `/api/testimonials/${editId}` : '/api/testimonials';
    const method = editId ? 'PUT' : 'POST';
    const res = await api(url, { method, json: form });
    if (res.ok) { toast.success(editId ? 'Updated!' : 'Created!'); setShowForm(false); setEditId(null); setForm({ ...EMPTY }); fetch_(); }
    else toast.error('Error saving');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return;
    await api(`/api/testimonials/${id}`, { method: 'DELETE' });
    toast.success('Deleted'); fetch_();
  };

  const startEdit = (t: any) => {
    setForm({ name: t.name, role: t.role, company: t.company || '', content: t.content, rating: t.rating, isPublished: t.isPublished });
    setEditId(t._id); setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Testimonials</h1>
          <p className="text-gray-400 text-sm">{testimonials.length} reviews</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY }); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold">
          <FiPlus /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#111] border border-gray-700 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">{editId ? 'Edit' : 'New'} Testimonial</h3>
            <button onClick={() => setShowForm(false)}><FiX className="text-gray-400" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[['name', 'Name *'], ['role', 'Role/Title *'], ['company', 'Company']].map(([field, label]) => (
              <div key={field}>
                <label className="block text-xs text-gray-400 mb-1">{label}</label>
                <input value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(r => (
                  <button key={r} onClick={() => setForm(p => ({ ...p, rating: r }))}
                    className={`p-1 ${form.rating >= r ? 'text-orange-400' : 'text-gray-600'} hover:text-orange-400`}>
                    <FiStar size={20} className={form.rating >= r ? 'fill-orange-400' : ''} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Review Content *</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={4}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-700 text-white text-sm focus:border-orange-500 focus:outline-none resize-none" />
          </div>
          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold">
            <FiSave /> Save
          </button>
        </motion.div>
      )}

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="space-y-3">
          {testimonials.length === 0 ? <div className="text-center py-12 text-gray-500">No testimonials yet.</div> :
            testimonials.map(t => (
              <div key={t._id} className="flex items-start justify-between p-5 bg-[#111] border border-gray-800 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium text-white">{t.name}</div>
                    <div className="flex">
                      {Array.from({ length: t.rating }).map((_, i) => <FiStar key={i} size={12} className="text-orange-400 fill-orange-400" />)}
                    </div>
                  </div>
                  <div className="text-orange-400 text-xs">{t.role}{t.company && ` @ ${t.company}`}</div>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{t.content}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => startEdit(t)} className="p-2 rounded-lg bg-gray-800 hover:bg-orange-500/20 hover:text-orange-400 text-gray-400"><FiEdit size={14} /></button>
                  <button onClick={() => handleDelete(t._id)} className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400"><FiTrash2 size={14} /></button>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
