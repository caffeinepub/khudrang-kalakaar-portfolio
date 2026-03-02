import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
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
        <span className="text-muted-foreground text-sm">No image</span>
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
      <section id="gallery" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Art Gallery</h2>
            <p className="text-muted-foreground text-lg">Loading artworks...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
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
    <section id="gallery" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-accent font-medium text-sm uppercase tracking-widest">Portfolio</span>
          <h2 className="text-4xl font-bold text-foreground mt-2 mb-4">Art Gallery</h2>
          <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {artworks.map((artwork) => (
            <div
              key={Number(artwork.id)}
              className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-xl transition-all duration-300"
              onClick={() => setSelectedArtwork(artwork)}
            >
              <ArtworkImage
                artwork={artwork}
                alt={artwork.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end">
                <div className="p-3 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-semibold text-sm leading-tight">{artwork.title}</p>
                  {artwork.description && (
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">{artwork.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedArtwork} onOpenChange={(open) => !open && setSelectedArtwork(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-background">
          <DialogTitle className="sr-only">{selectedArtwork?.title}</DialogTitle>
          <button
            onClick={() => setSelectedArtwork(null)}
            className="absolute top-3 right-3 z-10 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
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
              <div className="md:w-1/3 p-6 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-foreground mb-3">{selectedArtwork.title}</h3>
                {selectedArtwork.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedArtwork.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
