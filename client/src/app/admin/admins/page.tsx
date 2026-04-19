'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ username: '', password: '' });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.username);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api('/api/auth/admins');
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (err) {
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const res = await api('/api/auth/register', {
        method: 'POST',
        json: form,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Admin ${data.admin.username} created`);
        setForm({ username: '', password: '' });
        setFormOpen(false);
        fetchAdmins();
      } else {
        toast.error(data.error || 'Failed to create admin');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (username === currentUser) {
      toast.error('You cannot delete your own active account.');
      return;
    }
    if (username === 'Brave@Pratik') {
      toast.error('The primary admin account cannot be deleted.');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete admin "${username}"?`)) return;

    try {
      const res = await api(`/api/auth/admins/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Admin deleted');
        fetchAdmins();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Server error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Administrators</h1>
          <p className="text-gray-400 text-sm mt-1">Manage who has access to the admin portal.</p>
        </div>
        <button
          onClick={() => setFormOpen(!formOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium transition-all"
        >
          <FiPlus /> New Admin
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="bg-[#111] border border-gray-800 rounded-2xl p-6 space-y-4 mb-8">
          <h2 className="text-white font-medium mb-4">Create New Administrator</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase font-semibold">Username</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-800 focus:border-orange-500 focus:outline-none text-white text-sm"
                placeholder="e.g., manager_jane"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 uppercase font-semibold">Password</label>
              <input
                type="text"
                required
                minLength={6}
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0a0a0a] border border-gray-800 focus:border-orange-500 focus:outline-none text-white text-sm"
                placeholder="At least 6 characters"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitLoading}
              className="px-6 py-2.5 gradient-bg rounded-xl text-white font-medium text-sm disabled:opacity-50"
            >
              {submitLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-gray-500">Loading admins...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admins.map(admin => (
            <div key={admin._id} className="bg-[#111] border border-gray-800 rounded-2xl p-5 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 border border-gray-800">
                  <FiUser />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">{admin.username}</h3>
                  <p className="text-xs text-gray-500">Joined {new Date(admin.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleDelete(admin._id, admin.username)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                title={admin.username === currentUser || admin.username === 'Brave@Pratik' ? 'Cannot delete' : 'Delete access'}
                disabled={admin.username === currentUser || admin.username === 'Brave@Pratik'}
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          ))}
          {admins.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No admins found in database.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
