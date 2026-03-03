import { Brush, Building2, Palette, Layers, Sparkles, PenTool } from 'lucide-react';

const SERVICES = [
  {
    icon: Brush,
    title: 'Wall Murals',
    description:
      'Custom hand-painted murals for homes, offices, and commercial spaces that transform blank walls into stunning visual narratives.',
    number: '01',
  },
  {
    icon: Building2,
    title: 'Commercial Art',
    description:
      'Large-scale art installations for hotels, restaurants, and corporate spaces that reinforce brand identity and create memorable environments.',
    number: '02',
  },
  {
    icon: Palette,
    title: 'Interior Painting',
    description:
      'Expert interior painting services with premium finishes, texture work, and decorative techniques tailored to your aesthetic vision.',
    number: '03',
  },
  {
    icon: Layers,
    title: 'Texture & Finish',
    description:
      'Specialised texture applications including Venetian plaster, stucco, and custom finishes that add depth and character to any surface.',
    number: '04',
  },
  {
    icon: Sparkles,
    title: 'Heritage Restoration',
    description:
      'Sensitive restoration of heritage murals and traditional Rajasthani art forms, preserving cultural legacy with modern conservation techniques.',
    number: '05',
  },
  {
    icon: PenTool,
    title: 'Custom Illustrations',
    description:
      'Bespoke illustration and design services for signage, branding elements, and decorative art pieces crafted with meticulous attention to detail.',
    number: '06',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-inter text-gold font-semibold text-sm uppercase tracking-widest mb-3">
            What We Offer
          </p>
          <h2 className="font-playfair font-bold text-4xl lg:text-5xl text-white leading-tight">
            Our{' '}
            <em className="text-terracotta not-italic">Services</em>
          </h2>
          <p className="mt-4 font-inter text-white/80 max-w-2xl mx-auto leading-relaxed">
            From intimate home murals to grand public installations, we bring artistic excellence
            to every project.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.number}
                className="relative bg-charcoal-light border border-white/10 rounded-2xl p-8 overflow-hidden group hover:bg-terracotta transition-colors duration-300"
              >
                {/* Decorative Number */}
                <span className="absolute top-4 right-6 font-playfair font-bold text-6xl text-white/10 group-hover:text-white/20 transition-colors select-none">
                  {service.number}
                </span>

                {/* Icon */}
                <div className="relative z-10 mb-5">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-terracotta/20 group-hover:bg-white/20 transition-colors">
                    <Icon size={22} className="text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="font-playfair font-bold text-xl text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="font-inter text-white/80 text-sm leading-relaxed group-hover:text-white/90 transition-colors">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
