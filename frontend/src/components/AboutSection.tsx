export default function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Portrait Image */}
          <div className="relative order-2 lg:order-1">
            {/* Decorative background block */}
            <div className="absolute -top-4 -left-4 w-full h-full bg-terracotta-muted rounded-sm -z-10" />
            <div className="relative overflow-hidden rounded-sm shadow-warm-lg">
              <img
                src="/assets/generated/artist-portrait.dim_800x900.png"
                alt="Mudit Sharma – Wall Painting Artist"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-terracotta" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-terracotta" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-foreground text-background px-6 py-5 rounded-sm shadow-warm-lg">
              <p className="font-display text-4xl font-black leading-none text-terracotta">5+</p>
              <p className="font-body text-xs font-medium tracking-wide mt-1 text-background/70">Years of<br />Experience</p>
            </div>
          </div>

          {/* Text Content */}
          <div className="order-1 lg:order-2">
            <p className="terracotta-label mb-4">Meet the Artist</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-2">
              About Mudit<br />
              <span className="italic text-terracotta">Sharma</span>
            </h2>
            <span className="accent-bar" />

            <p className="font-body text-foreground/70 text-base md:text-lg leading-relaxed mb-5">
              Mudit Sharma is a professional wall painting artist based in{' '}
              <strong className="text-foreground font-semibold">Bikaner, Rajasthan</strong>, with over{' '}
              <strong className="text-foreground font-semibold">5 years of experience</strong> in residential,
              commercial, and public mural projects.
            </p>
            <p className="font-body text-foreground/70 text-base md:text-lg leading-relaxed mb-10">
              He specializes in customized wall art that enhances spaces and creates strong visual impact.
              His focus is on clean finishing, creative concepts, and complete client satisfaction.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
              {[
                { value: '5+', label: 'Years Active' },
                { value: '50+', label: 'Projects Done' },
                { value: '100%', label: 'Satisfaction' },
              ].map((stat) => (
                <div key={stat.label} className="text-center py-4 bg-secondary rounded-sm">
                  <p className="font-display text-2xl md:text-3xl font-black text-terracotta leading-none">{stat.value}</p>
                  <p className="font-body text-xs text-foreground/55 font-medium mt-1.5 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
