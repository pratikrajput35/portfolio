'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ContactPage() {
  const [settings, setSettings] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api('/api/contact', {
        method: 'POST',
        json: form,
      });
      if (res.ok) {
        toast.success('Message sent! I\'ll get back to you soon.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  if (!settings) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="site-container section-pad">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <p className="text-orange-400 text-sm font-semibold tracking-widest uppercase mb-3">Get In Touch</p>
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">{settings.contactHeadline || 'Contact Me'}</h1>
        <p className="text-[var(--muted)] max-w-xl mx-auto">{settings.contactDescription || 'Have a project in mind? Let\'s talk about it.'}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Info Column */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">{settings.contactTitle || "Let's Work Together"}</h2>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white flex-shrink-0"><FiMail size={18} /></div>
                <div>
                  <div className="font-semibold text-sm">Email</div>
                  <a href={`mailto:${settings.email}`} className="text-[var(--muted)] text-sm hover:text-orange-400 transition-colors">{settings.email || 'pratik@example.com'}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white flex-shrink-0"><FaWhatsapp size={18} /></div>
                <div>
                  <div className="font-semibold text-sm">WhatsApp</div>
                  <a href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] text-sm hover:text-orange-400 transition-colors">{settings.whatsapp || '+91 91365 43329'}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white flex-shrink-0"><FiMapPin size={18} /></div>
                <div>
                  <div className="font-semibold text-sm">Location</div>
                  <p className="text-[var(--muted)] text-sm">{settings.location || 'India (Remote Worldwide)'}</p>
                </div>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${settings.whatsapp?.replace(/\D/g, '')}?text=Hi%20Pratik%2C%20I%20would%20like%20to%20discuss%20a%20project.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-colors"
          >
            <FaWhatsapp size={22} /> Chat on WhatsApp
          </a>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="What's this about?"
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Message *</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Tell me about your project..."
                className="w-full px-4 py-3 rounded-xl bg-[var(--background)] border border-[var(--border)] focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 transition-all text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl gradient-bg text-white font-bold text-base hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/25"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiSend /> Send Message</>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
