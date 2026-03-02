import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { useMediaContacts, useTextContent } from '../hooks/useQueries';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: mediaContacts } = useMediaContacts();
  const { data: textContent } = useTextContent();

  const whatsappNumber = mediaContacts?.whatsappNumber || '';
  const artistName = textContent?.artistName || 'Artist';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      // Update active section
      const sections = NAV_LINKS.map((l) => l.href.replace('#', ''));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current = setTimeout(() => {
      logoTapCount.current = 0;
    }, 600);
    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      window.location.href = '/admin-login';
    }
  };

  const scrollTo = (href: string) => {
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  };

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : '#';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-warm-sm border-b border-warm-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            onClick={handleLogoTap}
            className="flex items-center gap-2 focus:outline-none"
            aria-label="Logo"
          >
            <img src="/assets/generated/logo.dim_256x256.png" alt="Logo" className="h-9 w-9 object-contain" />
            <span
              className={`font-display font-bold text-lg tracking-tight transition-colors ${
                scrolled ? 'text-charcoal' : 'text-cream'
              }`}
            >
              {artistName}
            </span>
          </button>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    scrolled
                      ? isActive
                        ? 'text-terracotta'
                        : 'text-charcoal hover:text-terracotta'
                      : isActive
                      ? 'text-gold'
                      : 'text-cream hover:text-gold'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-terracotta rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* WhatsApp CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream text-sm font-semibold px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-warm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              scrolled
                ? 'text-charcoal hover:bg-cream'
                : 'text-cream hover:bg-white/10'
            }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-warm-border shadow-warm">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-terracotta/10 text-terracotta'
                      : 'text-charcoal hover:bg-cream hover:text-terracotta'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mt-3 bg-terracotta text-cream text-sm font-semibold px-4 py-3 rounded-xl transition-colors hover:bg-terracotta/90"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
