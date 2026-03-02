import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SiInstagram, SiWhatsapp } from 'react-icons/si';
import { Heart } from 'lucide-react';

const WHATSAPP_NUMBER = '917665854193';
const WHATSAPP_MESSAGE = encodeURIComponent('Hello Mudit Sharma');
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
const INSTAGRAM_URL = 'https://www.instagram.com/khudrangkalakaar';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contact', href: '#contact' },
];

export default function Footer() {
  const navigate = useNavigate();

  const clickCount = React.useRef(0);
  const clickTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);

    if (clickCount.current >= 2) {
      clickCount.current = 0;
      navigate({ to: '/admin-login' });
      return;
    }

    clickTimer.current = setTimeout(() => {
      if (clickCount.current === 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      clickCount.current = 0;
    }, 500);
  };

  const scrollToSection = (href: string) => {
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const appId = encodeURIComponent(window.location.hostname || 'khudrang-kalakaar');

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div>
            <button
              onClick={handleLogoClick}
              className="font-bold text-xl tracking-tight mb-3 block text-left"
            >
              <span className="text-terracotta">K</span>hudrang{' '}
              <span className="text-terracotta">K</span>alakaar
            </button>
            <p className="text-gray-400 text-sm leading-relaxed">
              Professional mural artist transforming spaces with vibrant, meaningful art across India.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-pink-600 p-2.5 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <SiInstagram className="w-4 h-4" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-green-600 p-2.5 rounded-lg transition-colors"
                aria-label="WhatsApp"
              >
                <SiWhatsapp className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-gray-400 mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <SiWhatsapp className="w-4 h-4 text-green-500" />
                  +91 76658 54193
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                >
                  <SiInstagram className="w-4 h-4 text-pink-500" />
                  @khudrangkalakaar
                </a>
              </li>
              <li className="text-gray-400 text-sm">📍 Rajasthan, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Khudrang Kalakaar. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-terracotta fill-terracotta" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
