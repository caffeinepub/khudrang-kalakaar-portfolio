import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, MessageCircle } from "lucide-react";
import React from "react";
import {
  useGetCoverImage,
  useMediaContacts,
  useTextContent,
} from "../hooks/useQueries";
import { useSiteContent } from "../hooks/useSiteContent";

export default function HeroSection() {
  const { data: mediaContacts, isLoading: contactsLoading } =
    useMediaContacts();
  const { data: textContent, isLoading: textLoading } = useTextContent();
  const { data: coverImageBlob, isLoading: coverLoading } = useGetCoverImage();
  const { content: siteContent } = useSiteContent();

  const whatsappNumber = mediaContacts?.whatsappNumber || "";
  // Use backend text content when available, fall back to localStorage-based site content
  const artistName = textContent?.artistName || siteContent.artistName;
  const tagline = textContent?.tagline || siteContent.heroTagline;

  const coverImageUrl = coverImageBlob
    ? coverImageBlob.getDirectURL()
    : "/assets/generated/cover-hero.dim_1920x1080.png";

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`
    : "#";

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {coverLoading ? (
          <div className="w-full h-full bg-charcoal" />
        ) : (
          <img
            src={coverImageUrl}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        )}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 hero-overlay" />
        <div className="absolute inset-0 bg-charcoal/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-px w-16 bg-gold/70" />
          <span className="text-gold text-xs font-medium tracking-[0.3em] uppercase">
            Portfolio
          </span>
          <div className="h-px w-16 bg-gold/70" />
        </div>

        {/* Artist Name */}
        {textLoading ? (
          <Skeleton className="h-16 w-80 mx-auto mb-4 bg-white/20" />
        ) : (
          <h1
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-cream mb-4 leading-tight drop-shadow-lg"
            style={
              siteContent.artistNameColor
                ? { color: siteContent.artistNameColor }
                : undefined
            }
          >
            {artistName || "Artist Name"}
          </h1>
        )}

        {/* Tagline */}
        {textLoading ? (
          <Skeleton className="h-8 w-64 mx-auto mb-8 bg-white/20" />
        ) : (
          <p
            className="text-xl sm:text-2xl text-cream/90 font-light mb-8 leading-relaxed drop-shadow-md"
            style={
              siteContent.heroTaglineColor
                ? { color: siteContent.heroTaglineColor }
                : undefined
            }
          >
            {tagline || "Art is life"}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-12 mb-10">
          {[
            { value: "10+", label: "Years Experience" },
            { value: "200+", label: "Projects Done" },
            { value: "50+", label: "Happy Clients" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-bold text-gold drop-shadow-md">
                {stat.value}
              </div>
              <div className="text-cream/80 text-xs sm:text-sm mt-1 font-medium tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {contactsLoading ? (
            <Skeleton className="h-12 w-44 rounded-full bg-white/20" />
          ) : (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-terracotta hover:bg-terracotta/90 text-cream font-semibold px-8 py-3 rounded-full transition-all shadow-warm hover:shadow-warm-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Get in Touch
            </a>
          )}
          <button
            type="button"
            onClick={scrollToAbout}
            className="flex items-center gap-2 border-2 border-cream/60 hover:border-cream text-cream font-semibold px-8 py-3 rounded-full transition-all hover:bg-white/10"
          >
            View Work
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        type="button"
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/60 hover:text-cream transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
