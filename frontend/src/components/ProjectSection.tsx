import { MapPin } from 'lucide-react';

interface ProjectSectionProps {
  name: string;
  description: string;
  location?: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  index: number;
}

export default function ProjectSection({
  name,
  description,
  location,
  imageSrc,
  imageAlt,
  reverse = false,
  index,
}: ProjectSectionProps) {
  return (
    <article
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-[520px] border-b border-border last:border-b-0`}
    >
      {/* Image — 65% */}
      <div className="w-full lg:w-[65%] relative overflow-hidden bg-muted group">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover min-h-[300px] lg:min-h-[520px] transition-transform duration-700 group-hover:scale-105"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        {/* Project number badge */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="bg-terracotta text-white font-body text-xs font-bold px-3 py-1.5 tracking-[0.2em] uppercase">
            {String(index).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Text Panel — 35% */}
      <div
        className={`w-full lg:w-[35%] flex flex-col justify-center px-8 py-14 lg:py-20 bg-background ${
          reverse ? 'lg:pr-14 lg:pl-10' : 'lg:pl-14 lg:pr-10'
        }`}
      >
        {location && (
          <div className="flex items-center gap-1.5 text-terracotta font-body text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
        )}
        <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-black text-foreground leading-tight mb-4">
          {name}
        </h3>
        <span className="block w-10 h-0.5 bg-terracotta mb-6" />
        <p className="font-body text-foreground/60 text-sm md:text-base leading-relaxed">{description}</p>
      </div>
    </article>
  );
}
