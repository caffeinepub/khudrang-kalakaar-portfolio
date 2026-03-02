export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-6 md:px-12 lg:px-20 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Portrait Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-sm shadow-card">
              <img
                src="/assets/generated/artist-portrait.dim_800x900.png"
                alt="Mudit Sharma – Wall Painting Artist"
                className="w-full h-auto object-cover aspect-[4/5]"
              />
              {/* Decorative corner accent */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-terracotta" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-terracotta" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-5 -right-5 bg-terracotta text-white px-6 py-4 rounded-sm shadow-card">
              <p className="text-3xl font-black leading-none">5+</p>
              <p className="text-xs font-medium tracking-wide mt-0.5">Years of<br />Experience</p>
            </div>
          </div>

          {/* Text Content */}
          <div className="order-1 lg:order-2">
            <p className="text-terracotta text-sm font-semibold tracking-widest uppercase mb-3">
              Meet the Artist
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
              About Mudit<br />Sharma
            </h2>
            <span className="block w-16 h-1 bg-terracotta mb-8" />

            <p className="text-foreground/70 text-base md:text-lg leading-relaxed mb-6">
              Mudit Sharma is a professional wall painting artist based in{' '}
              <strong className="text-foreground font-semibold">Bikaner, Rajasthan</strong>, with over{' '}
              <strong className="text-foreground font-semibold">5 years of experience</strong> in residential,
              commercial, and public mural projects.
            </p>
            <p className="text-foreground/70 text-base md:text-lg leading-relaxed mb-10">
              He specializes in customized wall art that enhances spaces and creates strong visual impact.
              His focus is on clean finishing, creative concepts, and complete client satisfaction.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {[
                { value: '5+', label: 'Years Active' },
                { value: '50+', label: 'Projects Done' },
                { value: '100%', label: 'Client Satisfaction' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-terracotta">{stat.value}</p>
                  <p className="text-xs text-foreground/60 font-medium mt-1 leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
