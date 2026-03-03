import { useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Heart, Phone, Mail, MapPin, Instagram } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      navigate({ to: '/admin' });
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1500);
  };

  const currentYear = new Date().getFullYear();
  const appId = encodeURIComponent(
    typeof window !== 'undefined' ? window.location.hostname : 'khudrang-kalakaar'
  );

  return (
    <footer className="bg-charcoal text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <button
              onClick={handleLogoTap}
              className="flex items-center gap-3 focus:outline-none select-none"
              aria-label="Logo"
            >
              <img
                src="/assets/generated/logo-k.dim_200x200.png"
                alt="Khudrang Kalakaar Logo"
                className="h-12 w-12 object-contain"
              />
              <span className="font-playfair font-bold text-2xl text-cream">
                Khudrang Kalakaar
              </span>
            </button>
            <p className="text-cream/65 font-inter text-sm leading-relaxed">
              Transforming spaces with artistic vision and craftsmanship. Every wall tells a story.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-lg text-cream">Quick Links</h3>
            <ul className="space-y-2">
              {['Home', 'About', 'Services', 'Projects', 'Gallery', 'Contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      const el = document.getElementById(item.toLowerCase());
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-cream/65 hover:text-gold font-inter text-sm transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-playfair font-semibold text-lg text-cream">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-cream/65 font-inter text-sm">
                <Phone size={16} className="text-gold flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-cream/65 font-inter text-sm">
                <Mail size={16} className="text-gold flex-shrink-0" />
                <span>khudrangkalakaar@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-cream/65 font-inter text-sm">
                <MapPin size={16} className="text-gold flex-shrink-0" />
                <span>Ajmer, Rajasthan</span>
              </li>
              <li className="flex items-center gap-3 text-cream/65 font-inter text-sm">
                <Instagram size={16} className="text-gold flex-shrink-0" />
                <span>@khudrangkalakaar</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream/50 font-inter text-sm">
            © {currentYear} Khudrang Kalakaar. All rights reserved.
          </p>
          <p className="text-cream/50 font-inter text-sm flex items-center gap-1">
            Built with{' '}
            <Heart size={14} className="text-terracotta fill-terracotta" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-cream transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
