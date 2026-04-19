'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiFolder, FiGrid, FiStar, FiMail, FiArrowRight } from 'react-icons/fi';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, categories: 0, testimonials: 0, contacts: 0 });
  const [contacts, setContacts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api('/api/projects').then(r => r.json()),
      api('/api/categories').then(r => r.json()),
      api('/api/testimonials').then(r => r.json()),
      api('/api/admin/contacts').then(r => r.json()),
    ]).then(([p, c, t, con]) => {
      setStats({
        projects: Array.isArray(p) ? p.length : 0,
        categories: Array.isArray(c) ? c.length : 0,
        testimonials: Array.isArray(t) ? t.length : 0,
        contacts: Array.isArray(con) ? con.length : 0,
      });
      setContacts(Array.isArray(con) ? con.slice(0, 5) : []);
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Projects', value: stats.projects, icon: FiFolder, href: '/admin/projects', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { label: 'Categories', value: stats.categories, icon: FiGrid, href: '/admin/categories', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { label: 'Testimonials', value: stats.testimonials, icon: FiStar, href: '/admin/testimonials', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    { label: 'Contacts', value: stats.contacts, icon: FiMail, href: '/admin/contacts', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here&apos;s your portfolio overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={card.href}>
              <div className={`p-5 rounded-2xl border bg-[#111] hover:border-orange-500/40 transition-all group`}>
                <div className={`w-10 h-10 rounded-xl border ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon size={18} />
                </div>
                <div className="text-3xl font-extrabold text-white">{card.value}</div>
                <div className="text-gray-400 text-sm mt-0.5">{card.label}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Contacts */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-white">Recent Contacts</h2>
            <Link href="/admin/contacts" className="text-orange-400 text-xs hover:underline flex items-center gap-1">
              View all <FiArrowRight size={12} />
            </Link>
          </div>
          {contacts.length === 0 ? (
            <p className="text-gray-500 text-sm">No contact submissions yet.</p>
          ) : (
            <div className="space-y-3">
              {contacts.map(c => (
                <div key={c._id} className="flex items-start gap-3 p-3 rounded-xl bg-[#0a0a0a]">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-white truncate">{c.name}</div>
                    <div className="text-gray-500 text-xs truncate">{c.email}</div>
                    {c.subject && <div className="text-gray-400 text-xs mt-0.5 truncate">{c.subject}</div>}
                  </div>
                  {!c.isRead && <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6">
          <h2 className="font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/projects/new', label: '+ New Project' },
              { href: '/admin/categories', label: '+ New Category' },
              { href: '/admin/blog/new', label: '+ New Blog Post' },
              { href: '/admin/testimonials', label: '+ Testimonial' },
              { href: '/admin/content', label: 'Edit Content' },
              { href: '/admin/contacts', label: 'View Messages' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="p-3 rounded-xl bg-[#0a0a0a] border border-gray-800 hover:border-orange-500/50 hover:text-orange-400 text-sm font-medium transition-all text-gray-300 text-center"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
