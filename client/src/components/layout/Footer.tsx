'use client';
import Link from 'next/link';
import { FiInstagram, FiYoutube, FiLinkedin, FiMail } from 'react-icons/fi';
import { SiBehance } from 'react-icons/si';

const footerLinks = {
  Pages: [
    { href: '/portfolio', label: 'Portfolio' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
  Services: [
    { href: '/services#design', label: 'Graphic Design' },
    { href: '/services#video', label: 'Video Editing' },
    { href: '/services#branding', label: 'Brand Identity' },
    { href: '/services#motion', label: 'Motion Graphics' },
  ],
};

const socials = [
  { href: 'https://instagram.com', icon: FiInstagram, label: 'Instagram' },
  { href: 'https://youtube.com', icon: FiYoutube, label: 'YouTube' },
  { href: 'https://linkedin.com', icon: FiLinkedin, label: 'LinkedIn' },
  { href: 'https://behance.net', icon: SiBehance, label: 'Behance' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] mt-24">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white font-bold text-sm">
                PR
              </div>
              <span className="font-bold text-lg gradient-text">Pratik Rajput</span>
            </div>
            <p className="text-[var(--muted)] text-sm leading-relaxed mb-6 max-w-xs">
              Creative designer & video editor crafting visual experiences that captivate and convert.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[#f97316] hover:border-[#f97316] transition-all"
                >
                  <Icon size={16} />
                </a>
              ))}
              <a
                href="mailto:pratik@example.com"
                aria-label="Email"
                className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[#f97316] hover:border-[#f97316] transition-all"
              >
                <FiMail size={16} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-[var(--muted)] text-sm hover:text-[#f97316] transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-[var(--muted)] text-sm">© 2025 Pratik Rajput. All rights reserved.</p>
          <p className="text-[var(--muted)] text-xs flex items-center gap-1.5">
            Made by <span className="font-semibold text-white">Brave Studios</span> 🇮🇳 
            <span className="text-white">Pratik Rajput</span> 
            <a href="tel:9136543329" className="hover:text-[#f97316] transition-colors">9136543329</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
