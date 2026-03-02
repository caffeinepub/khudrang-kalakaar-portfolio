import { useTextContent, useCoverImage, useMediaContacts } from '../hooks/useQueries';

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <span className="inline-block text-accent font-medium text-sm uppercase tracking-widest mb-4">
          Mural Artist
        </span>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          {artistName}
        </h1>
        <p className="text-xl sm:text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          {tagline}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Hire Me
          </a>
          <a
            href="#gallery"
            className="inline-block border-2 border-white/60 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:bg-white/10"
          >
            View Gallery
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
          <div className="w-1 h-3 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
