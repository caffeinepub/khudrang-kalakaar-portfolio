import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useGetAllArtworks } from '../hooks/useQueries';

export default function ArtworkGallery() {
  const { data: artworks = [], isLoading } = useGetAllArtworks();
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

  const getImageUrl = (artwork: any) => {
    if (!artwork.image || artwork.image.length === 0) return null;
    const blob = new Blob([new Uint8Array(artwork.image)], {
      type: artwork.imageFormat || 'image/jpeg',
    });
    return URL.createObjectURL(blob);
  };

  return (
    <section id="gallery" className="section-padding bg-cream">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-terracotta text-sm font-semibold tracking-[0.25em] uppercase">
            My Work
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mt-2">
            Gallery
          </h2>
          <div className="w-16 h-1 bg-terracotta mx-auto mt-4 rounded-full" />
          <p className="text-charcoal/65 text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            A curated collection of artworks spanning murals, canvases, and interior transformations.
          </p>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20 bg-white border border-warm-border rounded-2xl">
            <p className="text-charcoal/40 font-medium text-lg">No artworks yet</p>
            <p className="text-charcoal/30 text-sm mt-2">Check back soon for new additions</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {artworks.map((artwork) => {
              const imageUrl = getImageUrl(artwork);
              return (
                <button
                  key={artwork.id.toString()}
                  onClick={() => setSelectedArtwork(artwork)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-cream-dark border border-warm-border hover:border-terracotta/40 hover:shadow-warm transition-all"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-charcoal/30 text-sm">No image</span>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {/* Title overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-cream font-semibold text-sm truncate">{artwork.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
        <DialogContent className="max-w-3xl bg-charcoal border-white/10 p-0 overflow-hidden">
          <DialogTitle className="sr-only">{selectedArtwork?.title}</DialogTitle>
          {selectedArtwork && (
            <div>
              {(() => {
                const url = getImageUrl(selectedArtwork);
                return url ? (
                  <img
                    src={url}
                    alt={selectedArtwork.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                ) : null;
              })()}
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-cream">
                  {selectedArtwork.title}
                </h3>
                {selectedArtwork.description && (
                  <p className="text-cream/70 text-sm mt-2 leading-relaxed">
                    {selectedArtwork.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
