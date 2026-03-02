import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, ZoomIn } from 'lucide-react';
import { useAllArtworks } from '../hooks/useQueries';
import type { Artwork } from '../backend';

function ArtworkImage({
  artwork,
  className,
  alt,
}: {
  artwork: Artwork;
  className?: string;
  alt: string;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (artwork.image && artwork.image.length > 0) {
      const mimeType = artwork.imageFormat || 'image/jpeg';
      const blob = new Blob([new Uint8Array(artwork.image)], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);
      prevUrlRef.current = url;
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setObjectUrl(null);
    }
  }, [artwork.image, artwork.imageFormat]);

  if (!objectUrl) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="font-body text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  return <img src={objectUrl} alt={alt} className={className} />;
}

export default function ArtworkGallery() {
  const { data: artworks, isLoading } = useAllArtworks();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  if (isLoading) {
    return (
      <section id="gallery" className="py-24 md:py-32 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="terracotta-label mb-4">Portfolio</p>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground">Art Gallery</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!artworks || artworks.length === 0) {
    return null;
  }

  return (
    <section id="gallery" className="py-24 md:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="terracotta-label mb-4">Portfolio</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight">
              Art <span className="italic text-terracotta">Gallery</span>
            </h2>
          </div>
          <p className="font-body text-foreground/55 text-base max-w-xs leading-relaxed">
            Click any artwork to view it in full detail.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {artworks.map((artwork) => (
            <div
              key={Number(artwork.id)}
              className="group relative aspect-square overflow-hidden rounded-sm cursor-pointer shadow-card hover:shadow-warm-lg transition-all duration-400"
              onClick={() => setSelectedArtwork(artwork)}
            >
              <ArtworkImage
                artwork={artwork}
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all duration-300 flex flex-col items-center justify-center">
                <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-2" size={24} />
                <div className="px-3 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-center">
                  <p className="font-display font-bold text-sm leading-tight">{artwork.title}</p>
                  {artwork.description && (
                    <p className="font-body text-xs text-white/75 mt-1 line-clamp-2">{artwork.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedArtwork} onOpenChange={(open) => !open && setSelectedArtwork(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-foreground border-0">
          <DialogTitle className="sr-only">{selectedArtwork?.title}</DialogTitle>
          <button
            onClick={() => setSelectedArtwork(null)}
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
          >
            <X size={18} />
          </button>
          {selectedArtwork && (
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/3 bg-black flex items-center justify-center min-h-64">
                <ArtworkImage
                  artwork={selectedArtwork}
                  alt={selectedArtwork.title}
                  className="max-h-[70vh] w-full object-contain"
                />
              </div>
              <div className="md:w-1/3 p-8 flex flex-col justify-center bg-foreground">
                <span className="terracotta-label mb-3 text-terracotta">Artwork</span>
                <h3 className="font-display text-2xl font-bold text-background mb-4 leading-tight">{selectedArtwork.title}</h3>
                <div className="w-8 h-0.5 bg-terracotta mb-4" />
                {selectedArtwork.description && (
                  <p className="font-body text-background/60 text-sm leading-relaxed">{selectedArtwork.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
