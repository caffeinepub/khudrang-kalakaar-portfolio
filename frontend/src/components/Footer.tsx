import { Palette, Heart } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'khudrang-kalakaar');

  return (
    <footer className="bg-foreground text-white py-10 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-sm bg-terracotta flex items-center justify-center">
              <Palette className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="font-bold text-base tracking-tight">Khudrang Kalakaar</span>
          </div>

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
