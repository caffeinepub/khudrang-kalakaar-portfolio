import React from 'react';
import { MapPin } from 'lucide-react';

interface ProjectSectionProps {
  number: string;
  title: string;
  description: string;
  location: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
}

export default function ProjectSection({
  number,
  title,
  description,
  location,
  image,
  imageAlt,
  reverse = false,
}: ProjectSectionProps) {
  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-[65%_35%] gap-0 rounded-2xl overflow-hidden shadow-warm border border-warm-border ${
        reverse ? 'lg:grid-cols-[35%_65%]' : ''
      }`}
    >
      {/* Image */}
      <div className={`relative overflow-hidden ${reverse ? 'lg:order-2' : ''}`}>
        <img
          src={image}
          alt={imageAlt}
          className="w-full h-64 lg:h-full object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>

      {/* Text Panel */}
      <div
        className={`bg-white p-8 lg:p-10 flex flex-col justify-center ${
          reverse ? 'lg:order-1' : ''
        }`}
      >
        {/* Project number badge */}
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="bg-terracotta text-cream text-xs font-bold px-3 py-1 rounded-full">
            {number}
          </span>
          <div className="flex items-center gap-1 text-charcoal/50 text-xs">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        </div>

        {/* Accent bar */}
        <div className="w-8 h-1 bg-terracotta rounded-full mb-3" />

        {/* Title */}
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-charcoal mb-4 leading-tight">
          {title}
        </h3>

        {/* Description */}
        <p className="text-charcoal/65 text-sm sm:text-base leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
