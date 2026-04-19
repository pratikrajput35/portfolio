'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass shadow-2xl shadow-black/50 !border-l-0 !border-r-0 !border-t-0' 
        : 'bg-transparent border-transparent'
    }`}>
      <nav className="flex items-center justify-between px-6 sm:px-8 py-3 w-full max-w-[1600px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xs">
            PR
          </div>
          <span className="font-bold text-sm tracking-wide hidden sm:block">Pratik Rajput</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-all px-4 py-1.5 rounded-full ${
                pathname === href 
                  ? 'bg-white/10 text-white' 
                  : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center justify-center px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-orange-500 hover:text-white transition-colors"
          >
            Let's work
          </Link>
          <button
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center bg-white/10 border border-white/10 text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="pointer-events-auto absolute top-full left-4 right-4 mt-4 glass rounded-3xl overflow-hidden md:hidden shadow-2xl"
          >
            <div className="p-6 flex flex-col gap-2">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`text-lg font-medium p-3 rounded-2xl transition-all ${
                    pathname === href
                      ? 'bg-white/10 text-white'
                      : 'text-[var(--muted)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setIsMobileOpen(false)}
                className="mt-4 flex items-center justify-center w-full py-4 rounded-full bg-white text-black font-bold transition-colors hover:bg-orange-500 hover:text-white"
              >
                Let's work together
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
