import React from 'react';
import { Award, Heart, Clock, Star, Shield, Zap } from 'lucide-react';

const TRUST_POINTS = [
  {
    icon: Award,
    number: '01',
    title: 'Award-Winning Quality',
    description:
      'Recognized excellence in artistic craftsmanship with multiple industry accolades and client commendations.',
  },
  {
    icon: Heart,
    number: '02',
    title: 'Passion-Driven Work',
    description:
      'Every project is approached with genuine passion and dedication, ensuring each piece tells a unique story.',
  },
  {
    icon: Clock,
    number: '03',
    title: 'Timely Delivery',
    description:
      'Committed to meeting deadlines without compromising on quality — your timeline is respected.',
  },
  {
    icon: Star,
    number: '04',
    title: 'Premium Materials',
    description:
      'Only the finest paints, canvases, and materials are used to ensure longevity and vibrant results.',
  },
  {
    icon: Shield,
    number: '05',
    title: 'Satisfaction Guaranteed',
    description:
      'Your satisfaction is the ultimate goal. We work closely with you until the vision is perfectly realized.',
  },
  {
    icon: Zap,
    number: '06',
    title: 'Innovative Techniques',
    description:
      'Blending traditional artistry with modern techniques to create truly contemporary masterpieces.',
  },
];

export default function WhyChooseSection() {
  return (
    <section className="section-padding bg-cream-dark">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="text-terracotta text-sm font-semibold tracking-[0.25em] uppercase">
            Why Choose Me
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mt-2">
            The Difference
          </h2>
          <div className="w-16 h-1 bg-terracotta mx-auto mt-4 rounded-full" />
        </div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div
                key={point.number}
                className="group relative bg-white border border-warm-border hover:border-terracotta/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-warm overflow-hidden"
              >
                {/* Number watermark */}
                <span className="absolute top-3 right-4 font-display text-6xl font-bold text-charcoal/5 group-hover:text-terracotta/10 select-none transition-colors">
                  {point.number}
                </span>

                {/* Accent bar */}
                <div className="w-8 h-1 bg-terracotta rounded-full mb-4 group-hover:w-12 transition-all duration-300" />

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-terracotta/10 group-hover:bg-terracotta/20 flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-5 h-5 text-terracotta" />
                </div>

                {/* Text */}
                <h3 className="font-display text-lg font-bold text-charcoal mb-2 leading-snug">
                  {point.title}
                </h3>
                <p className="text-charcoal/65 text-sm leading-relaxed">{point.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
