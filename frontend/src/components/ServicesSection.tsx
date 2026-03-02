import { CheckCircle2 } from 'lucide-react';

const SERVICES = [
  { title: 'Home Wall Murals', desc: 'Transform your living spaces with custom hand-crafted murals.' },
  { title: 'Kids Room Theme Painting', desc: 'Magical, vibrant themes that spark imagination and joy.' },
  { title: 'Café & Restaurant Concept Walls', desc: 'Instagram-worthy walls that elevate your brand identity.' },
  { title: 'Hotel & Resort Artwork', desc: 'Sophisticated murals that enhance guest experience.' },
  { title: 'Public Infrastructure Art', desc: 'Beautifying urban spaces with culturally rich murals.' },
  { title: '3D Illusion Wall Designs', desc: 'Mind-bending optical illusions that wow every visitor.' },
  { title: 'Custom Hand-Painted Designs', desc: 'Fully bespoke artwork tailored to your vision and space.' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 px-6 md:px-12 lg:px-20 bg-secondary">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-terracotta text-sm font-semibold tracking-widest uppercase mb-3">
            What We Offer
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Services</h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-terracotta/40" />
            <div className="w-2 h-2 rounded-full bg-terracotta" />
            <div className="h-px w-12 bg-terracotta/40" />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-sm p-6 shadow-xs hover:shadow-card transition-all duration-300 hover:-translate-y-1 group border border-border"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-terracotta-light flex items-center justify-center group-hover:bg-terracotta transition-colors duration-300">
                  <CheckCircle2 className="w-5 h-5 text-terracotta group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base mb-1.5 leading-snug">{service.title}</h3>
                  <p className="text-foreground/60 text-sm leading-relaxed">{service.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
