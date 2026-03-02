import { Brush, Home, Coffee, Building2, Landmark, Layers, Sparkles } from 'lucide-react';

const SERVICES = [
  { icon: Home, title: 'Home Wall Murals', desc: 'Transform your living spaces with custom hand-crafted murals tailored to your personality.' },
  { icon: Sparkles, title: 'Kids Room Theme Painting', desc: 'Magical, vibrant themes that spark imagination and bring joy to every corner.' },
  { icon: Coffee, title: 'Café & Restaurant Concept Walls', desc: 'Instagram-worthy walls that elevate your brand identity and attract customers.' },
  { icon: Building2, title: 'Hotel & Resort Artwork', desc: 'Sophisticated murals that enhance guest experience and create lasting impressions.' },
  { icon: Landmark, title: 'Public Infrastructure Art', desc: 'Beautifying urban spaces with culturally rich, community-inspired murals.' },
  { icon: Layers, title: '3D Illusion Wall Designs', desc: 'Mind-bending optical illusions that wow every visitor and create viral moments.' },
  { icon: Brush, title: 'Custom Hand-Painted Designs', desc: 'Fully bespoke artwork tailored to your unique vision, space, and brand story.' },
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 md:py-32 px-6 md:px-12 lg:px-20 bg-foreground">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="font-body text-terracotta text-xs font-semibold tracking-[0.25em] uppercase mb-4">
              What We Offer
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-background leading-tight">
              Our <span className="italic text-terracotta">Services</span>
            </h2>
          </div>
          <p className="font-body text-background/50 text-base max-w-xs leading-relaxed">
            From intimate home murals to large-scale public installations — we do it all.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-background/10">
          {SERVICES.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="group bg-foreground hover:bg-terracotta-dark p-8 transition-all duration-300 cursor-default relative overflow-hidden"
              >
                {/* Number watermark */}
                <span className="absolute top-4 right-5 font-display text-6xl font-black text-background/5 select-none leading-none group-hover:text-white/5">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="w-10 h-10 rounded-sm bg-terracotta/20 group-hover:bg-white/15 flex items-center justify-center mb-5 transition-colors duration-300">
                  <Icon className="w-5 h-5 text-terracotta group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-display font-bold text-background text-lg mb-2.5 leading-snug group-hover:text-white">
                  {service.title}
                </h3>
                <p className="font-body text-background/50 text-sm leading-relaxed group-hover:text-white/70">
                  {service.desc}
                </p>
              </div>
            );
          })}
          {/* Filler cell to complete the grid visually */}
          <div className="hidden lg:block bg-terracotta/10 p-8" />
        </div>
      </div>
    </section>
  );
}
