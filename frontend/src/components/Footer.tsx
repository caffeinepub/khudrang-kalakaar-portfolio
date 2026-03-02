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
    <footer className="bg-foreground border-t border-white/10">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          {/* Brand — 5 cols */}
          <div className="md:col-span-5">
            <button
              onClick={handleLogoInteraction}
              className="flex items-center gap-3 mb-5 focus:outline-none group"
              aria-label="Logo"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-terracotta transition-colors">
                <img src={logoSrc} alt="Khudrang Kalakaar Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-display font-bold text-lg text-background leading-none">Khudrang</p>
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-background/40 mt-0.5">Kalakaar</p>
              </div>
            </button>
            <p className="font-body text-background/50 text-sm leading-relaxed max-w-xs">
              Transforming blank walls into meaningful art. Mural artist based in Rajasthan, available pan India.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-sm bg-white/8 hover:bg-terracotta flex items-center justify-center transition-colors duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle size={16} className="text-background/70" />
              </a>
              <a
                href={instagramProfile}
                target="_blank"
                rel="noopener noreferrer external"
                className="w-9 h-9 rounded-sm bg-white/8 hover:bg-terracotta flex items-center justify-center transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={16} className="text-background/70" />
              </a>
            </div>
          </div>

          {/* Quick Links — 3 cols */}
          <div className="md:col-span-3">
            <h3 className="font-display font-bold text-background text-sm mb-5 tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-body text-sm text-background/45 hover:text-terracotta transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-background/20 group-hover:bg-terracotta group-hover:w-5 transition-all duration-300" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact — 4 cols */}
          <div className="md:col-span-4">
            <h3 className="font-display font-bold text-background text-sm mb-5 tracking-wide">Contact</h3>
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 font-body text-sm text-background/45">
                <MapPin size={15} className="text-terracotta flex-shrink-0" />
                Rajasthan, India
              </li>
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 font-body text-sm text-background/45 hover:text-terracotta transition-colors"
                >
                  <MessageCircle size={15} className="text-terracotta flex-shrink-0" />
                  {whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={instagramProfile}
                  target="_blank"
                  rel="noopener noreferrer external"
                  className="flex items-center gap-3 font-body text-sm text-background/45 hover:text-terracotta transition-colors"
                >
                  <Instagram size={15} className="text-terracotta flex-shrink-0" />
                  @{instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-sm text-background/30">
            © {new Date().getFullYear()} Khudrang Kalakaar. All rights reserved.
          </p>
          <p className="font-body flex items-center gap-1.5 text-sm text-background/30">
            Built with <Heart size={13} className="text-terracotta fill-terracotta" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-terracotta transition-colors font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
