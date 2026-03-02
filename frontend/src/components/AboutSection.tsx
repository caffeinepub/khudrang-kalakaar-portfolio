import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTextContent, useGetArtistPortrait } from '../hooks/useQueries';

const STATS = [
  { value: '10+', label: 'Years of Experience' },
  { value: '200+', label: 'Projects Completed' },
  { value: '50+', label: 'Happy Clients' },
  { value: '15+', label: 'Awards Won' },
];

export default function AboutSection() {
  const { data: textContent, isLoading: textLoading } = useTextContent();
  const { data: portraitBlob, isLoading: portraitLoading } = useGetArtistPortrait();

  const artistName = textContent?.artistName || '';
  const bio = textContent?.bio || '';
  const portraitUrl = portraitBlob
    ? portraitBlob.getDirectURL()
    : '/assets/generated/artist-portrait.dim_800x900.png';

  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-terracotta text-sm font-semibold tracking-[0.25em] uppercase">
            About Me
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mt-2">
            The Artist Behind the Work
          </h2>
          <div className="w-16 h-1 bg-terracotta mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Portrait */}
          <div className="relative">
            {portraitLoading ? (
              <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
            ) : (
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full border-2 border-terracotta/30 rounded-2xl" />
                <img
                  src={portraitUrl}
                  alt={artistName || 'Artist portrait'}
                  className="relative w-full aspect-[4/5] object-cover rounded-2xl shadow-warm-lg"
                />
                {/* Gold accent */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/20 rounded-2xl -z-10" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {textLoading ? (
              <>
                <Skeleton className="h-10 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-full rounded-lg" />
                <Skeleton className="h-5 w-full rounded-lg" />
                <Skeleton className="h-5 w-4/5 rounded-lg" />
              </>
            ) : (
              <>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-charcoal leading-tight">
                  {artistName || 'Artist Name'}
                </h3>
                <p className="text-charcoal/75 text-base sm:text-lg leading-relaxed">
                  {bio || 'Artist bio goes here.'}
                </p>
              </>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-cream rounded-xl p-4 border border-warm-border hover:border-terracotta/40 hover:shadow-warm-sm transition-all"
                >
                  <div className="font-display text-2xl font-bold text-terracotta">
                    {stat.value}
                  </div>
                  <div className="text-charcoal/70 text-sm mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
