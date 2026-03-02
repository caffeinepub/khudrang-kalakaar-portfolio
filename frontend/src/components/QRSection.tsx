import { useMediaContacts } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Instagram } from 'lucide-react';

const DEFAULT_INSTAGRAM = 'https://instagram.com/khudrangkalakaar';

export default function QRSection() {
  const { data: mediaContacts, isLoading } = useMediaContacts();

  const instagramProfile = mediaContacts?.instagramProfile || DEFAULT_INSTAGRAM;
  const instagramHandle = instagramProfile
    .replace(/.*instagram\.com\//, '')
    .replace(/\/$/, '');

  const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(instagramProfile)}&choe=UTF-8`;

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-foreground">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-14 md:gap-20">
          {/* QR Code */}
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div className="bg-background p-4 rounded-sm shadow-warm-lg border border-white/10">
              {isLoading ? (
                <Skeleton className="w-[180px] h-[180px] rounded-sm" />
              ) : (
                <img
                  src={qrUrl}
                  alt={`QR code for Instagram @${instagramHandle}`}
                  className="w-[180px] h-[180px] rounded-sm"
                />
              )}
            </div>
            <p className="font-body text-xs text-background/40 text-center tracking-wide">
              Scan to follow on Instagram
            </p>
          </div>

          {/* Text */}
          <div className="text-center md:text-left">
            <p className="font-body text-terracotta text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              Follow Along
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-black text-background leading-tight mb-4">
              See My Work on<br />
              <span className="italic text-terracotta">Instagram</span>
            </h2>
            <span className="block w-10 h-0.5 bg-terracotta mb-6 mx-auto md:mx-0" />
            <p className="font-body text-background/50 text-base mb-8 max-w-sm leading-relaxed">
              Follow my journey and get inspired by the latest murals, paintings, and art installations.
            </p>
            {isLoading ? (
              <Skeleton className="h-12 w-44 rounded-full" />
            ) : (
              <a
                href={instagramProfile}
                target="_blank"
                rel="noopener noreferrer external"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-body font-semibold text-sm px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity shadow-warm"
              >
                <Instagram size={16} />
                @{instagramHandle}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
