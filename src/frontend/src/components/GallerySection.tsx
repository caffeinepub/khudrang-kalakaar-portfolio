import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff, ZoomIn } from "lucide-react";
import React, { useState } from "react";
import type { GalleryImage } from "../backend";
import { useGetGalleryImages } from "../hooks/useQueries";

export default function GallerySection() {
  const { data: images = [], isLoading } = useGetGalleryImages();
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="section-padding bg-cream">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-terracotta text-sm font-semibold tracking-[0.25em] uppercase font-inter">
            My Artwork
          </span>
          <h2 className="font-playfair text-4xl sm:text-5xl font-bold text-charcoal mt-2">
            Gallery
          </h2>
          <div className="w-16 h-1 bg-terracotta mx-auto mt-4 rounded-full" />
          <p className="text-charcoal/65 font-inter text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            A curated collection of artworks spanning murals, canvases, and
            interior transformations.
          </p>
        </div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((key) => (
              <Skeleton key={key} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 bg-white border border-cream-dark rounded-2xl">
            <ImageOff size={48} className="mx-auto text-charcoal/20 mb-4" />
            <p className="text-charcoal/40 font-inter font-medium text-lg">
              No artwork yet
            </p>
            <p className="text-charcoal/30 font-inter text-sm mt-2">
              Check back soon for new additions
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => {
              const url = image.blob.getDirectURL();
              return (
                <button
                  type="button"
                  key={String(image.id)}
                  onClick={() => setSelected(image)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-cream-dark border border-cream-dark hover:border-terracotta/40 hover:shadow-warm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta/50"
                >
                  <img
                    src={url}
                    alt={image.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-300 flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  {/* Filename overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-cream font-inter text-xs truncate">
                      {image.filename}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl bg-charcoal border-white/10 p-0 overflow-hidden">
          <DialogTitle className="sr-only">{selected?.filename}</DialogTitle>
          {selected && (
            <div>
              <img
                src={selected.blob.getDirectURL()}
                alt={selected.filename}
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="px-6 py-4">
                <p className="font-inter text-cream/70 text-sm truncate">
                  {selected.filename}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
