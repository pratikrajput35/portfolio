'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        json: form,
      });
      if (res.ok) {
        toast.success('Welcome back!');
        router.push('/admin');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Invalid credentials');
      }
    } catch {
      toast.error('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            PR
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#111] border border-gray-800 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0a0a0a] border border-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 text-white text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#0a0a0a] border border-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30 text-white text-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl gradient-bg text-white font-bold text-sm hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Protected admin area • Unauthorized access prohibited
        </p>
      </motion.div>
    </div>
  );
}
