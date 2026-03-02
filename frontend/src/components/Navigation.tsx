import { useState, useEffect } from 'react';
import { Menu, X, Palette, Settings } from 'lucide-react';
import { useScrollSpy } from '../hooks/useScrollSpy';
import { useGetLogo, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const NAV_LINKS = [
  { label: 'About', href: 'about' },
  { label: 'Services', href: 'services' },
  { label: 'Why Us', href: 'why-us' },
  { label: 'Projects', href: 'projects' },
  { label: 'Gallery', href: 'gallery' },
  { label: 'Contact', href: 'contact' },
];

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useScrollSpy(NAV_LINKS.map((l) => l.href));

  const { data: logoBlob } = useGetLogo();
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const handleLogoClick = async () => {
    if (isAuthenticated) {
      // Already logged in — go to admin if admin, else scroll to top
      if (isAdmin) {
        window.location.href = '/admin';
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Not logged in — trigger login then redirect to admin
      try {
        await login();
        // After login, navigate to admin (admin check happens on that page)
        window.location.href = '/admin';
      } catch {
        // Login cancelled or failed — just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  const logoUrl = logoBlob ? logoBlob.getDirectURL() : null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-xs border-b border-border' : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 md:px-10 h-[72px] flex items-center justify-between">
        {/* Brand — clicking logo triggers admin login flow */}
        <button
          onClick={handleLogoClick}
          disabled={isLoggingIn}
          className="flex items-center gap-2 group disabled:opacity-70"
          title={isLoggingIn ? 'Signing in…' : undefined}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Khudrang Kalakaar Logo" className="w-8 h-8 rounded-sm object-cover" />
          ) : (
            <span className="w-8 h-8 rounded-sm bg-terracotta flex items-center justify-center">
              <Palette className="w-4 h-4 text-white" />
            </span>
          )}
          <span className="font-bold text-lg tracking-tight text-foreground group-hover:text-terracotta transition-colors">
            Khudrang Kalakaar
          </span>
        </button>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => scrollTo(link.href)}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                  activeSection === link.href
                    ? 'text-terracotta bg-terracotta-light/40'
                    : 'text-foreground/70 hover:text-terracotta hover:bg-terracotta-light/20'
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
          {isAuthenticated && isAdmin && (
            <li>
              <a
                href="/admin"
                className="px-3 py-2 text-sm font-medium rounded-sm text-foreground/60 hover:text-terracotta hover:bg-terracotta-light/20 transition-colors flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                Admin
              </a>
            </li>
          )}
          <li>
            <button
              onClick={() => scrollTo('contact')}
              className="ml-3 px-5 py-2 text-sm font-semibold bg-terracotta text-white rounded-sm hover:bg-terracotta-dark transition-colors"
            >
              Hire Me
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-sm text-foreground hover:bg-muted transition-colors"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border shadow-card">
          <ul className="flex flex-col py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  onClick={() => scrollTo(link.href)}
                  className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${
                    activeSection === link.href
                      ? 'text-terracotta bg-terracotta-light/30'
                      : 'text-foreground/80 hover:text-terracotta hover:bg-muted'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
            {isAuthenticated && isAdmin && (
              <li>
                <a
                  href="/admin"
                  className="w-full text-left px-6 py-3 text-sm font-medium text-foreground/80 hover:text-terracotta hover:bg-muted transition-colors flex items-center gap-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" /> Admin Panel
                </a>
              </li>
            )}
            <li className="px-6 pt-2 pb-3">
              <button
                onClick={() => scrollTo('contact')}
                className="w-full py-2.5 text-sm font-semibold bg-terracotta text-white rounded-sm hover:bg-terracotta-dark transition-colors"
              >
                Hire Me
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
