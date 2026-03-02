import React, { useRef } from 'react';
import { Heart, Instagram, MessageCircle } from 'lucide-react';
import { useMediaContacts, useTextContent } from '../hooks/useQueries';

const QUICK_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  const { data: mediaContacts } = useMediaContacts();
  const { data: textContent } = useTextContent();
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const whatsappNumber = mediaContacts?.whatsappNumber || '';
  const instagramProfile = mediaContacts?.instagramProfile || '';
  const artistName = textContent?.artistName || 'Artist';

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`
    : '#';

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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'artist-portfolio'
  );

  return (
    <footer className="bg-charcoal text-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <button
              onClick={handleLogoTap}
              className="flex items-center gap-2 mb-4 focus:outline-none"
              aria-label="Logo"
            >
              <img
                src="/assets/generated/logo.dim_256x256.png"
                alt="Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="font-display text-xl font-bold text-cream">{artistName}</span>
            </button>
            <p className="text-cream/65 text-sm leading-relaxed max-w-xs">
              Transforming spaces with art, passion, and creativity. Every brushstroke tells a story.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 mt-5">
              {whatsappNumber && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-terracotta flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-cream" />
                </a>
              )}
              {instagramProfile && (
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-terracotta flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4 text-cream" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-base font-bold text-cream mb-4 tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-cream/65 hover:text-gold text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-base font-bold text-cream mb-4 tracking-wide">
              Get in Touch
            </h4>
            <div className="space-y-3">
              {whatsappNumber && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cream/65 hover:text-gold text-sm transition-colors"
                >
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  {whatsappNumber}
                </a>
              )}
              {instagramProfile && (
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cream/65 hover:text-gold text-sm transition-colors break-all"
                >
                  <Instagram className="w-4 h-4 flex-shrink-0" />
                  Instagram
                </a>
              )}
              <p className="text-cream/50 text-sm">Rajasthan, India</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream/50 text-xs">
            © {new Date().getFullYear()} {artistName}. All rights reserved.
          </p>
          <p className="text-cream/50 text-xs flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-terracotta fill-terracotta" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold/80 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
