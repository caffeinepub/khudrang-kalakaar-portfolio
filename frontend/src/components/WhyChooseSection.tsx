import { CheckCircle2 } from 'lucide-react';

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
    <section id="why-us" className="py-20 px-6 md:px-12 lg:px-20 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-14">
          <div>
            <p className="text-terracotta text-sm font-semibold tracking-widest uppercase mb-3">
              Our Promise
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Why Clients<br />Trust Us
            </h2>
            <span className="block w-16 h-1 bg-terracotta mt-4" />
          </div>
          <div className="flex items-center">
            <p className="text-foreground/60 text-base md:text-lg leading-relaxed">
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
              className="relative bg-secondary rounded-sm p-6 border border-border hover:border-terracotta/30 transition-all duration-300 group"
            >
              {/* Number accent */}
              <span className="absolute top-4 right-5 text-5xl font-black text-terracotta/8 select-none leading-none">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-5 h-5 text-terracotta flex-shrink-0" />
                <h3 className="font-bold text-foreground text-sm leading-snug">{point.title}</h3>
              </div>
              <p className="text-foreground/60 text-sm leading-relaxed pl-8">{point.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
