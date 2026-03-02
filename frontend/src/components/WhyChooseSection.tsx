const TRUST_POINTS = [
  {
    title: '5+ Years Practical Experience',
    desc: 'Proven expertise across residential, commercial, and public projects.',
  },
  {
    title: 'Unique Custom Designs',
    desc: 'Every artwork is original — crafted specifically for your space and vision.',
  },
  {
    title: 'Premium Quality Paints',
    desc: 'Only high-grade, long-lasting paints used for vibrant, durable results.',
  },
  {
    title: 'Professional & Clean Work',
    desc: 'Meticulous attention to detail with zero mess and clean site management.',
  },
  {
    title: 'On-Time Project Completion',
    desc: 'Committed to deadlines — your project delivered on schedule, every time.',
  },
  {
    title: 'Budget-Friendly Packages',
    desc: 'Flexible pricing options to suit every budget without compromising quality.',
  },
];

export default function WhyChooseSection() {
  return (
    <section id="why-us" className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end mb-16">
          <div>
            <p className="terracotta-label mb-4">Our Promise</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight">
              Why Clients<br />
              <span className="italic text-terracotta">Trust Us</span>
            </h2>
            <span className="accent-bar" />
          </div>
          <div>
            <p className="font-body text-foreground/60 text-base md:text-lg leading-relaxed">
              We combine artistic excellence with professional reliability — delivering wall art that
              exceeds expectations and stands the test of time.
            </p>
          </div>
        </div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_POINTS.map((point, idx) => (
            <div
              key={idx}
              className="relative bg-secondary rounded-sm p-7 border border-border hover:border-terracotta/40 hover:shadow-warm transition-all duration-300 group overflow-hidden"
            >
              {/* Number accent */}
              <span className="absolute -top-2 -right-1 font-display text-7xl font-black text-terracotta/6 select-none leading-none group-hover:text-terracotta/10 transition-colors">
                {String(idx + 1).padStart(2, '0')}
              </span>
              {/* Top accent line */}
              <div className="w-8 h-0.5 bg-terracotta mb-5 group-hover:w-14 transition-all duration-300" />
              <h3 className="font-display font-bold text-foreground text-base mb-2.5 leading-snug">{point.title}</h3>
              <p className="font-body text-foreground/55 text-sm leading-relaxed">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
