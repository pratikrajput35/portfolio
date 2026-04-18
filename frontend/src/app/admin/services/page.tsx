'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface Service {
  _id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  order: number;
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'design',
    description: '',
    icon: 'FaPalette',
    color: 'text-orange-500',
    features: '',
    order: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api('/api/services');
      if (res.ok) {
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        category: service.category,
        description: service.description,
        icon: service.icon || 'FaPalette',
        color: service.color || 'text-orange-500',
        features: service.features.join('\n'),
        order: service.order || 0
      });
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        category: 'design',
        description: '',
        icon: 'FaPalette',
        color: 'text-orange-500',
        features: '',
        order: services.length
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingService ? 'Updating service...' : 'Creating service...');
    
    try {
      const payload = {
        ...formData,
        features: formData.features.split('\n').filter(f => f.trim() !== '')
      };

      const url = editingService ? `/api/services/${editingService._id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await api(url, {
        method,
        json: payload
      });

      if (!res.ok) throw new Error('Failed to save service');

      toast.success(editingService ? 'Service updated' : 'Service created', { id: loadingToast });
      fetchServices();
      closeModal();
    } catch (error) {
      toast.error('Error saving service', { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    const loadingToast = toast.loading('Deleting service...');
    try {
      const res = await api(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete service');
      
      toast.success('Service deleted', { id: loadingToast });
      fetchServices();
    } catch (error) {
      toast.error('Error deleting service', { id: loadingToast });
    }
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Services & Capabilities</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
        >
          <FiPlus /> Add Service
        </button>
      </div>

      <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3">
        <FiSearch className="text-[var(--muted)] ml-2" />
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/20"
        />
      </div>

      {loading ? (
        <div className="text-[var(--muted)] text-center py-10">Loading services...</div>
      ) : filteredServices.length === 0 ? (
        <div className="glass-card p-10 rounded-[2rem] text-center border border-white/5">
          <p className="text-[var(--muted)]">No services found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, i) => (
            <motion.div
              key={service._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-3xl border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold tracking-widest uppercase text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">
                  {service.category}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(service)} className="text-[var(--muted)] hover:text-white transition-colors p-2 glass rounded-full">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(service._id)} className="text-[var(--muted)] hover:text-red-500 transition-colors p-2 glass rounded-full">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-[var(--muted)] text-sm line-clamp-3 mb-4">{service.description}</p>
              <div className="text-xs text-[var(--muted)] font-medium">
                {service.features.length} Features • Order: {service.order}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[var(--card)] border border-white/10 rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none"
                  >
                    <option value="design" className="bg-[#080808]">Graphic Design</option>
                    <option value="video" className="bg-[#080808]">Video Editing</option>
                    <option value="other" className="bg-[#080808]">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-y custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Icon Component Name (React Icons)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="e.g. FaPalette, FaVideo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Color Utility Class</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="e.g. text-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Order (for sorting)</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase text-[var(--muted)]">Features (one per line)</label>
                <textarea
                  rows={5}
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors resize-y custom-scrollbar"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 rounded-full font-medium text-[var(--muted)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-bold bg-white text-black hover:bg-orange-500 hover:text-white transition-colors shadow-lg shadow-white/10"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
