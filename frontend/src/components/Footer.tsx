import { useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, MessageCircle, Instagram, MapPin } from 'lucide-react';
import { useLogo, useMediaContacts } from '../hooks/useQueries';

const DEFAULT_WHATSAPP = '917665854193';
const DEFAULT_INSTAGRAM = 'https://instagram.com/khudrangkalakaar';
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I came across your artwork portfolio and I'm interested in discussing a potential project. Could you please share more details about your services and availability?"
);

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#projects', label: 'Projects' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
];

export default function Footer() {
  const navigate = useNavigate();
  const { data: logo } = useLogo();
  const { data: mediaContacts } = useMediaContacts();

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const whatsappNumber = mediaContacts?.whatsappNumber || DEFAULT_WHATSAPP;
  const instagramProfile = mediaContacts?.instagramProfile || DEFAULT_INSTAGRAM;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${WHATSAPP_MESSAGE}`;
  const whatsappDisplay = whatsappNumber.startsWith('91')
    ? `+91 ${whatsappNumber.slice(2, 7)} ${whatsappNumber.slice(7)}`
    : `+${whatsappNumber}`;
  const instagramHandle = instagramProfile
    .replace(/.*instagram\.com\//, '')
    .replace(/\/$/, '');

  const handleLogoInteraction = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 2) {
      tapCountRef.current = 0;
      navigate({ to: '/admin-login' });
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 500);
    }
  };

  const logoSrc = logo
    ? logo.getDirectURL()
    : '/assets/generated/logo.dim_256x256.png';

  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'khudrang-kalakaar'
  );

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <button
              onClick={handleLogoInteraction}
              className="flex items-center mb-4 focus:outline-none"
              aria-label="Logo"
            >
              <img src={logoSrc} alt="Logo" className="h-10 w-10 object-contain rounded-full" />
            </button>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Transforming blank walls into meaningful art. Mural artist based in Rajasthan, available pan India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={16} className="text-accent flex-shrink-0" />
                Rajasthan, India
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <MessageCircle size={16} className="text-green-600 flex-shrink-0" />
                  {whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  <Instagram size={16} className="text-pink-600 flex-shrink-0" />
                  @{instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Khudrang Kalakaar. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart size={14} className="text-accent fill-accent" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
