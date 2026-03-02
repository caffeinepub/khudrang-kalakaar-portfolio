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
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} min-h-[480px] border-b border-border last:border-b-0`}
    >
      {/* Image — 70% */}
      <div className="w-full lg:w-[70%] relative overflow-hidden bg-muted">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover min-h-[300px] lg:min-h-[480px] transition-transform duration-700 hover:scale-105"
        />
        {/* Project number overlay */}
        <div className="absolute top-5 left-5 bg-terracotta text-white text-xs font-bold px-3 py-1.5 rounded-sm tracking-widest uppercase">
          Project {String(index).padStart(2, '0')}
        </div>
      </div>

      {/* Text Panel — 30% */}
      <div
        className={`w-full lg:w-[30%] flex flex-col justify-center px-8 py-12 lg:py-16 bg-white ${
          reverse ? 'lg:pr-12 lg:pl-10' : 'lg:pl-12 lg:pr-10'
        }`}
      >
        {location && (
          <div className="flex items-center gap-1.5 text-terracotta text-xs font-semibold tracking-widest uppercase mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">{name}</h3>
        <span className="block w-10 h-0.5 bg-terracotta mb-6" />
        <p className="text-foreground/65 text-sm md:text-base leading-relaxed">{description}</p>
      </div>
    </article>
  );
}
