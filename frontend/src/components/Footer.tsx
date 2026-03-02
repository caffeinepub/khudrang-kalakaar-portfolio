import { Palette, Heart } from 'lucide-react';
import { useGetLogo } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'khudrang-kalakaar');
  const { data: logoBlob } = useGetLogo();
  const logoUrl = logoBlob ? logoBlob.getDirectURL() : null;

  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogoClick = async () => {
    if (isAuthenticated) {
      if (isAdmin) {
        window.location.href = '/admin';
      }
    } else {
      try {
        await login();
        window.location.href = '/admin';
      } catch {
        // Login cancelled — do nothing
      }
    }
  };

  return (
    <footer className="bg-foreground text-white py-10 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand — clicking logo triggers admin login flow */}
          <button
            onClick={handleLogoClick}
            disabled={isLoggingIn}
            className="flex items-center gap-2 group disabled:opacity-70"
            title={isLoggingIn ? 'Signing in…' : undefined}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Khudrang Kalakaar" className="w-7 h-7 rounded-sm object-cover" />
            ) : (
              <span className="w-7 h-7 rounded-sm bg-terracotta flex items-center justify-center">
                <Palette className="w-3.5 h-3.5 text-white" />
              </span>
            )}
            <span className="font-bold text-base tracking-tight group-hover:text-terracotta transition-colors">
              Khudrang Kalakaar
            </span>
          </button>

          {/* Center */}
          <div className="text-center">
            <p className="text-white/50 text-xs">
              © {year} Mudit Sharma – Khudrang Kalakaar. All rights reserved.
            </p>
            <p className="text-white/40 text-xs mt-1">
              📍 Bikaner, Rajasthan · Wall Painting Artist
            </p>
          </div>

          {/* Attribution */}
          <p className="text-white/40 text-xs flex items-center gap-1">
            Built with{' '}
            <Heart className="w-3 h-3 text-terracotta fill-terracotta inline" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-terracotta hover:text-terracotta-light transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
