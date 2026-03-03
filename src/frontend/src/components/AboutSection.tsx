import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import React from "react";
import { useGetArtistPortrait, useTextContent } from "../hooks/useQueries";
import { useSiteContent } from "../hooks/useSiteContent";

export default function AboutSection() {
  const { data: textContent, isLoading: textLoading } = useTextContent();
  const { data: portraitBlob, isLoading: portraitLoading } =
    useGetArtistPortrait();
  const { content: siteContent } = useSiteContent();

  const STATS = [
    {
      value: siteContent.stat1Value || "5+",
      label: siteContent.stat1Label || "Years of Experience",
      valueColor: siteContent.stat1ValueColor,
      labelColor: siteContent.stat1LabelColor,
    },
    {
      value: siteContent.stat2Value || "150+",
      label: siteContent.stat2Label || "Masterpieces",
      valueColor: siteContent.stat2ValueColor,
      labelColor: siteContent.stat2LabelColor,
    },
    {
      value: siteContent.stat3Value || "12+",
      label: siteContent.stat3Label || "City Landmarks",
      valueColor: siteContent.stat3ValueColor,
      labelColor: siteContent.stat3LabelColor,
    },
    {
      value: siteContent.stat4Value || "50k+",
      label: siteContent.stat4Label || "Sq. Ft. Painted",
      valueColor: siteContent.stat4ValueColor,
      labelColor: siteContent.stat4LabelColor,
    },
  ];

  // Use backend text content when available, fall back to localStorage-based site content
  const artistName = textContent?.artistName || siteContent.artistName;
  const bio = textContent?.bio || siteContent.aboutBio;
  const portraitUrl = portraitBlob
    ? portraitBlob.getDirectURL()
    : "/assets/generated/artist-portrait.dim_800x900.png";

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
                  alt={artistName || "Artist portrait"}
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
                <h3
                  className="font-display text-3xl sm:text-4xl font-bold text-charcoal leading-tight"
                  style={
                    siteContent.artistNameColor
                      ? { color: siteContent.artistNameColor }
                      : undefined
                  }
                >
                  {artistName || "Artist Name"}
                </h3>
                {siteContent.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-terracotta shrink-0" />
                    <span
                      className="font-inter text-sm text-charcoal/60 font-medium"
                      style={
                        siteContent.locationColor
                          ? { color: siteContent.locationColor }
                          : undefined
                      }
                    >
                      {siteContent.location}
                    </span>
                  </div>
                )}
                <p
                  className="text-charcoal/75 text-base sm:text-lg leading-relaxed"
                  style={
                    siteContent.aboutBioColor
                      ? { color: siteContent.aboutBioColor }
                      : undefined
                  }
                >
                  {bio || "Artist bio goes here."}
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
                  <div
                    className="font-display text-2xl font-bold text-terracotta"
                    style={
                      stat.valueColor ? { color: stat.valueColor } : undefined
                    }
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-charcoal/70 text-sm mt-1 font-medium"
                    style={
                      stat.labelColor ? { color: stat.labelColor } : undefined
                    }
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
