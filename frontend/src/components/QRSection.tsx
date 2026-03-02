import React from 'react';
import { Instagram } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaContacts } from '../hooks/useQueries';

export default function QRSection() {
  const { data: mediaContacts, isLoading } = useMediaContacts();
  const instagramProfile = mediaContacts?.instagramProfile || '';

  return (
    <section className="section-padding bg-charcoal">
      <div className="max-w-2xl mx-auto text-center">
        {/* Section Header */}
        <span className="text-gold text-sm font-semibold tracking-[0.25em] uppercase">
          Follow Along
        </span>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream mt-2 mb-4">
          On Instagram
        </h2>
        <div className="w-16 h-1 bg-terracotta mx-auto mb-8 rounded-full" />

        <p className="text-cream/70 text-base sm:text-lg leading-relaxed mb-10">
          Scan the QR code or tap the button below to follow for daily art updates, behind-the-scenes, and new project reveals.
        </p>

        {/* QR Code */}
        <div className="inline-block bg-white p-4 rounded-2xl shadow-warm-lg mb-8">
          <img
            src="/assets/generated/instagram-qr-khudrangkalakaar.dim_600x650.png"
            alt="Instagram QR Code"
            className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
          />
        </div>

        {/* Follow Button */}
        {isLoading ? (
          <Skeleton className="h-12 w-48 mx-auto rounded-full bg-white/10" />
        ) : (
          <div>
            <a
              href={instagramProfile || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-semibold px-8 py-3 rounded-full transition-all shadow-warm hover:shadow-warm-lg"
            >
              <Instagram className="w-5 h-5" />
              Follow on Instagram
            </a>
            {instagramProfile && (
              <p className="text-cream/50 text-xs mt-3 break-all">{instagramProfile}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
