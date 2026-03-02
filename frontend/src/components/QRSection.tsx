import { useMediaContacts } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_INSTAGRAM = 'https://instagram.com/khudrangkalakaar';

// Minimal QR code generator (pure TypeScript, no external lib)
function generateQRMatrix(text: string): boolean[][] {
  // We use a simple approach: encode as a URL and generate a fixed-size placeholder
  // For a real QR, we'd use a library. Here we use the Google Charts API via img tag.
  return [];
}

export default function QRSection() {
  const { data: mediaContacts, isLoading } = useMediaContacts();

  const instagramProfile = mediaContacts?.instagramProfile || DEFAULT_INSTAGRAM;
  const instagramHandle = instagramProfile
    .replace(/.*instagram\.com\//, '')
    .replace(/\/$/, '');

  // Use Google Charts QR API (client-side only, no backend needed)
  const qrUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(instagramProfile)}&choe=UTF-8`;

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 justify-center">
          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-border">
              {isLoading ? (
                <Skeleton className="w-[200px] h-[200px] rounded-lg" />
              ) : (
                <img
                  src={qrUrl}
                  alt={`QR code for Instagram @${instagramHandle}`}
                  className="w-[200px] h-[200px] rounded-lg"
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan to follow on Instagram
            </p>
          </div>

          {/* Text */}
          <div className="text-center md:text-left max-w-sm">
            <span className="text-accent font-medium text-sm uppercase tracking-widest">Follow Along</span>
            <h2 className="text-3xl font-bold text-foreground mt-2 mb-4">
              See My Work on Instagram
            </h2>
            <p className="text-muted-foreground mb-6">
              Follow my journey and get inspired by the latest murals, paintings, and art installations.
            </p>
            {isLoading ? (
              <Skeleton className="h-12 w-40 rounded-full" />
            ) : (
              <a
                href={instagramProfile}
                target="_blank"
                rel="noopener noreferrer external"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                @{instagramHandle}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
