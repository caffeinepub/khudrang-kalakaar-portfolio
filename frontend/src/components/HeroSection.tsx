import { useTextContent, useCoverImage, useMediaContacts } from '../hooks/useQueries';
import { ArrowDown, MessageCircle } from 'lucide-react';

const DEFAULT_WHATSAPP = '917665854193';
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hello, I came across your artwork portfolio and I'm interested in discussing a potential project. Could you please share more details about your services and availability?"
);

export default function HeroSection() {
  const { data: textContent } = useTextContent();
  const { data: coverImage } = useCoverImage();
  const { data: mediaContacts } = useMediaContacts();

  const whatsappNumber = mediaContacts?.whatsappNumber || DEFAULT_WHATSAPP;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${WHATSAPP_MESSAGE}`;

  const artistName = textContent?.artistName || 'Mudit Sharma';
  const tagline = textContent?.tagline || 'Transforming Blank Walls into Meaningful Art.';

  const bgImage = coverImage
    ? coverImage.getDirectURL()
    : '/assets/generated/cover-hero.dim_1920x1080.png';

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-end justify-start overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Layered gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />

      {/* Decorative top-right accent */}
      <div className="absolute top-24 right-8 md:right-16 hidden md:flex flex-col items-end gap-2 opacity-60">
        <div className="w-px h-16 bg-white/40" />
        <p className="font-body text-[10px] text-white/60 tracking-[0.3em] uppercase rotate-90 origin-right translate-x-6">
          Mural Artist
        </p>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20 md:pb-28">
        {/* Label */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-px bg-terracotta" />
          <span className="font-body text-terracotta text-xs font-semibold tracking-[0.3em] uppercase">
            Bikaner, Rajasthan
          </span>
        </div>

        {/* Artist Name */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] mb-6 tracking-tight">
          {artistName}
        </h1>

        {/* Tagline */}
        <p className="font-body text-lg sm:text-xl md:text-2xl text-white/75 mb-10 max-w-xl leading-relaxed font-light">
          {tagline}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 bg-terracotta hover:bg-terracotta-dark text-white font-body font-semibold text-sm px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-warm-lg"
          >
            <MessageCircle size={16} />
            Hire Me on WhatsApp
          </a>
          <a
            href="#gallery"
            className="inline-flex items-center justify-center gap-2.5 border border-white/40 hover:border-white/80 text-white font-body font-medium text-sm px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
          >
            View Gallery
          </a>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-8 mt-14 pt-8 border-t border-white/15">
          {[
            { value: '5+', label: 'Years Experience' },
            { value: '50+', label: 'Projects Completed' },
            { value: '100%', label: 'Client Satisfaction' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl md:text-3xl font-bold text-terracotta leading-none">{stat.value}</p>
              <p className="font-body text-[10px] text-white/50 tracking-widest uppercase mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 md:right-16 flex flex-col items-center gap-2 opacity-50">
        <p className="font-body text-[9px] text-white tracking-[0.3em] uppercase">Scroll</p>
        <ArrowDown size={14} className="text-white animate-bounce" />
      </div>
    </section>
  );
}
