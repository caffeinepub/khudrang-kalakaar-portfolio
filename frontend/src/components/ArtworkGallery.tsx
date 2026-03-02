import { useState } from 'react';
import { useGetAllArtworks } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImagePlus, X } from 'lucide-react';
import type { Artwork } from '../backend';

function ArtworkCard({ artwork, onClick }: { artwork: Artwork; onClick: () => void }) {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-sm border border-border bg-white shadow-xs hover:shadow-card transition-all duration-300 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        <img
          src={artwork.image.getDirectURL()}
          alt={artwork.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-xs font-medium">Click to view</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm truncate">{artwork.title}</h3>
        {artwork.description && (
          <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{artwork.description}</p>
        )}
      </div>
    </div>
  );
}

export default function ArtworkGallery() {
  const { data: artworks = [], isLoading } = useGetAllArtworks();
  const [selected, setSelected] = useState<Artwork | null>(null);

  if (!isLoading && artworks.length === 0) return null;

  return (
    <section id="gallery" className="py-20 px-6 md:px-12 lg:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-terracotta text-sm font-semibold tracking-widest uppercase mb-3">
            Portfolio
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Artwork Gallery
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-terracotta/40" />
            <div className="w-2 h-2 rounded-full bg-terracotta" />
            <div className="h-px w-12 bg-terracotta/40" />
          </div>
          <p className="text-foreground/60 text-base max-w-lg mx-auto">
            A collection of wall paintings, murals, and artistic creations by Mudit Sharma.
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-sm" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {artworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id.toString()}
                artwork={artwork}
                onClick={() => setSelected(artwork)}
              />
            ))}
          </div>
        )}

        {artworks.length > 0 && (
          <p className="text-center text-muted-foreground text-sm mt-8">
            {artworks.length} artwork{artworks.length !== 1 ? 's' : ''} in the collection
          </p>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selected && (
            <>
              <img
                src={selected.image.getDirectURL()}
                alt={selected.title}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-5">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    {selected.title}
                  </DialogTitle>
                </DialogHeader>
                {selected.description && (
                  <p className="text-muted-foreground text-sm mt-2">{selected.description}</p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
