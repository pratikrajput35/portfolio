'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiGrid, FiFolder, FiMessageSquare, FiStar,
  FiLayers, FiFileText, FiSettings, FiMail, FiLogOut,
  FiMenu, FiX, FiGlobe, FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: FiHome },
  { href: '/admin/categories', label: 'Categories', icon: FiGrid },
  { href: '/admin/projects', label: 'Projects', icon: FiFolder },
  { href: '/admin/testimonials', label: 'Testimonials', icon: FiStar },
  { href: '/admin/services', label: 'Services', icon: FiLayers },
  { href: '/admin/blog', label: 'Blog', icon: FiFileText },
  { href: '/admin/about', label: 'About Me', icon: FiUser },
  { href: '/admin/content', label: 'Site Content', icon: FiSettings },
  { href: '/admin/contacts', label: 'Contacts', icon: FiMail },
];

function SidebarLink({ href, label, icon: Icon, isActive, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'gradient-bg text-white shadow-lg shadow-orange-500/20'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out');
    router.push('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">PR</div>
          <div>
            <div className="font-bold text-white text-sm">Admin Panel</div>
            <div className="text-gray-500 text-xs">Portfolio Manager</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <SidebarLink
            key={item.href}
            {...item}
            isActive={pathname === item.href}
            onClick={() => setSidebarOpen(false)}
          />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <FiGlobe size={18} /> View Site
        </Link>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <FiLogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#111] border-r border-gray-800 fixed left-0 top-0 bottom-0 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-[#111] border-r border-gray-800 z-50 lg:hidden flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:pl-60">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-800 h-14 flex items-center px-4 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <FiMenu size={22} />
          </button>
          <div className="flex-1">
            <span className="text-sm text-gray-400">
              {navItems.find(n => n.href === pathname)?.label || 'Admin'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 text-white">
          {children}
        </main>
      </div>
    </div>
  );
}
