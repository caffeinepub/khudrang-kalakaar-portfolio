export default function HeroSection() {
  const scrollToAbout = () => {
    const el = document.getElementById('about');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url('/assets/generated/cover-hero.dim_1920x1080.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Experience badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span>🖌</span>
          <span>5+ Years Experience</span>
        </div>

        {/* Artist Name */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none mb-4">
          MUDIT
          <br />
          <span className="text-terracotta">SHARMA</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl font-medium text-white/80 tracking-widest uppercase mb-3">
          Professional Wall Painting Artist
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 bg-terracotta/60" />
          <span className="text-terracotta text-lg">✦</span>
          <div className="h-px w-16 bg-terracotta/60" />
        </div>

        {/* Location */}
        <p className="text-white/70 text-sm font-medium mb-8 tracking-wide">
          📍 Bikaner, Rajasthan
        </p>

        {/* Tagline */}
        <blockquote className="text-xl md:text-2xl font-light italic text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          "Transforming Blank Walls into Meaningful Art."
        </blockquote>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => scrollToAbout()}
            className="px-8 py-3.5 bg-terracotta text-white font-semibold rounded-sm hover:bg-terracotta-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Explore Portfolio
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('contact');
              if (el) {
                const top = el.getBoundingClientRect().top + window.scrollY - 72;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}
            className="px-8 py-3.5 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-sm hover:bg-white/20 transition-all duration-200"
          >
            Get In Touch
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50">
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-8 bg-white/30 animate-pulse" />
      </div>
    </section>
  );
}
