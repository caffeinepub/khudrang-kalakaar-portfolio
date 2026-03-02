import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Menu, X, Phone } from 'lucide-react';
import { useLogo, useMediaContacts } from '../hooks/useQueries';

const DEFAULT_WHATSAPP = '917665854193';
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

export default function Navigation() {
  const navigate = useNavigate();
  const { data: logo } = useLogo();
  const { data: mediaContacts } = useMediaContacts();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const whatsappNumber = mediaContacts?.whatsappNumber || DEFAULT_WHATSAPP;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${WHATSAPP_MESSAGE}`;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-card/96 backdrop-blur-lg shadow-card border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={handleLogoInteraction}
            className="flex items-center gap-3 focus:outline-none group"
            aria-label="Logo"
          >
            <div className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all duration-300 ${
              isScrolled ? 'border-terracotta/30' : 'border-white/30'
            } group-hover:border-terracotta`}>
              <img src={logoSrc} alt="Khudrang Kalakaar Logo" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className={`font-display font-bold text-base leading-none transition-colors ${
                isScrolled ? 'text-foreground' : 'text-white'
              }`}>Khudrang</p>
              <p className={`font-body text-[10px] tracking-[0.2em] uppercase transition-colors ${
                isScrolled ? 'text-terracotta' : 'text-white/70'
              }`}>Kalakaar</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`font-body text-sm font-medium tracking-wide transition-colors relative group ${
                  isScrolled ? 'text-foreground/70 hover:text-terracotta' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-terracotta transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-terracotta hover:bg-terracotta-dark text-white font-body text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-300 shadow-warm hover:shadow-warm-lg hover:-translate-y-0.5"
            >
              <Phone size={14} />
              Hire Me
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-foreground hover:bg-secondary' : 'text-white hover:bg-white/10'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card/98 backdrop-blur-xl border-t border-border shadow-card-hover">
          <div className="px-5 py-5 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-3 font-body text-sm font-medium text-foreground/80 hover:text-terracotta hover:bg-terracotta-muted rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 pb-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-dark text-white font-body text-sm font-semibold px-5 py-3 rounded-full transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone size={14} />
                Hire Me
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
