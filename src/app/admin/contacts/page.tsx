'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCheck, FiTrash2, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchContacts = () => {
    setLoading(true);
    fetch('/api/admin/contacts').then(r => r.json()).then(d => { setContacts(Array.isArray(d) ? d : []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(fetchContacts, []);

  const markRead = async (id: string) => {
    await fetch(`/api/admin/contacts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isRead: true }) });
    fetchContacts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
    toast.success('Deleted');
    setSelected(null);
    fetchContacts();
  };

  const unread = contacts.filter(c => !c.isRead).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Contact Submissions</h1>
        <p className="text-gray-400 text-sm">{contacts.length} messages{unread > 0 ? ` • ${unread} unread` : ''}</p>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <div className="text-center py-12">
                <FiMail size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No contact submissions yet.</p>
              </div>
            ) : contacts.map(c => (
              <button
                key={c._id}
                onClick={() => { setSelected(c); if (!c.isRead) markRead(c._id); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selected?._id === c._id ? 'border-orange-500 bg-orange-500/5' : 'border-gray-800 bg-[#111] hover:border-gray-700'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{c.name}</span>
                      {!c.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />}
                    </div>
                    <div className="text-gray-500 text-xs">{c.email}</div>
                    {c.subject && <div className="text-gray-400 text-xs mt-0.5 truncate">{c.subject}</div>}
                    <div className="text-gray-500 text-xs mt-1">{new Date(c.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div>
            {selected ? (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#111] border border-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white">{selected.name}</h3>
                    <a href={`mailto:${selected.email}`} className="text-orange-400 text-sm">{selected.email}</a>
                  </div>
                  <div className="flex gap-2">
                    {!selected.isRead && (
                      <button onClick={() => markRead(selected._id)} className="p-2 rounded-lg bg-gray-800 hover:bg-green-500/20 hover:text-green-400 text-gray-400"><FiCheck size={14} /></button>
                    )}
                    <button onClick={() => handleDelete(selected._id)} className="p-2 rounded-lg bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400"><FiTrash2 size={14} /></button>
                  </div>
                </div>
                {selected.subject && <div className="text-sm font-semibold text-gray-300 mb-3">{selected.subject}</div>}
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                <div className="mt-4 text-gray-500 text-xs">{new Date(selected.createdAt).toLocaleString('en-IN')}</div>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || 'Your inquiry'}`}
                  className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-semibold w-full justify-center">
                  <FiMail /> Reply via Email
                </a>
              </motion.div>
            ) : (
              <div className="bg-[#111] border border-gray-800 rounded-2xl p-12 text-center text-gray-500">
                <FiEye size={32} className="mx-auto mb-3" />
                <p>Select a message to view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
