import React from 'react';
import { SiWhatsapp } from 'react-icons/si';
import { ChevronDown } from 'lucide-react';
import { useGetCoverImage, useGetTextContent } from '../hooks/useQueries';

const WHATSAPP_NUMBER = '917665854193';
const WHATSAPP_MESSAGE = encodeURIComponent('Hello Mudit Sharma');
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function HeroSection() {
  const { data: coverImage } = useGetCoverImage();
  const { data: textContent } = useGetTextContent();

  const artistName = textContent?.artistName || 'Mudit Sharma';
  const tagline = textContent?.tagline || 'Transforming Spaces with Art';

  const scrollToPortfolio = () => {
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const coverImageUrl = coverImage
    ? coverImage.getDirectURL()
    : '/assets/generated/cover-hero.dim_1920x1080.png';

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={coverImageUrl}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <p className="text-terracotta font-semibold text-sm uppercase tracking-widest mb-4">
          Professional Mural Artist
        </p>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          {artistName}
        </h1>
        <p className="text-xl sm:text-2xl text-white/80 mb-10 font-light">{tagline}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta-dark text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl"
          >
            <SiWhatsapp className="w-5 h-5" />
            Get in Touch
          </a>
          <button
            onClick={scrollToPortfolio}
            className="flex items-center justify-center gap-2 border-2 border-white/60 hover:border-white text-white font-semibold px-8 py-4 rounded-full transition-all hover:bg-white/10"
          >
            View Portfolio
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToPortfolio}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
        aria-label="Scroll down"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
