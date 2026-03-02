import React from 'react';
import { Paintbrush, Home, Building2, Palette, Layers, Sparkles } from 'lucide-react';

const SERVICES = [
  {
    icon: Paintbrush,
    number: '01',
    title: 'Wall Art & Murals',
    description:
      'Custom hand-painted murals and wall art that transform any space into a visual masterpiece.',
  },
  {
    icon: Home,
    number: '02',
    title: 'Interior Decoration',
    description:
      'Comprehensive interior decoration services blending aesthetics with functionality for homes and offices.',
  },
  {
    icon: Building2,
    number: '03',
    title: 'Commercial Spaces',
    description:
      'Artistic solutions for restaurants, hotels, and commercial establishments that leave lasting impressions.',
  },
  {
    icon: Palette,
    number: '04',
    title: 'Canvas Paintings',
    description:
      'Original canvas paintings crafted with passion — available as commissions or ready-to-hang pieces.',
  },
  {
    icon: Layers,
    number: '05',
    title: 'Texture & Finish',
    description:
      'Specialty texture work and decorative finishes that add depth and character to any surface.',
  },
  {
    icon: Sparkles,
    number: '06',
    title: 'Custom Commissions',
    description:
      'Bespoke artwork created to your vision — from concept to completion with your unique story.',
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="section-padding bg-charcoal">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-gold text-sm font-semibold tracking-[0.25em] uppercase">
            What I Offer
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-cream mt-2">
            Services
          </h2>
          <div className="w-16 h-1 bg-terracotta mx-auto mt-4 rounded-full" />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.number}
                className="group relative bg-white/5 hover:bg-terracotta/90 border border-white/10 hover:border-terracotta rounded-2xl p-6 transition-all duration-300 cursor-default overflow-hidden"
              >
                {/* Number watermark */}
                <span className="absolute top-3 right-4 font-display text-6xl font-bold text-white/5 group-hover:text-white/10 select-none transition-colors">
                  {service.number}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-terracotta/20 group-hover:bg-white/20 flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-6 h-6 text-terracotta group-hover:text-cream transition-colors" />
                </div>

                {/* Text */}
                <h3 className="font-display text-lg font-bold text-cream mb-2 leading-snug">
                  {service.title}
                </h3>
                <p className="text-cream/70 group-hover:text-cream/90 text-sm leading-relaxed transition-colors">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
