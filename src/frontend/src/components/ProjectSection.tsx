import { MapPin } from "lucide-react";

interface ProjectSectionProps {
  title: string;
  description: string;
  image: string;
  location?: string;
  reversed?: boolean;
  index?: number;
}

export default function ProjectSection({
  title,
  description,
  image,
  location,
  reversed = false,
  index = 0,
}: ProjectSectionProps) {
  return (
    <div
      className={`flex flex-col ${
        reversed ? "lg:flex-row-reverse" : "lg:flex-row"
      } min-h-[420px] overflow-hidden rounded-2xl shadow-warm-lg`}
    >
      {/* Image Panel */}
      <div className="lg:w-[65%] relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-64 lg:h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 to-transparent" />
        <div className="absolute top-4 left-4 bg-terracotta text-cream font-inter text-xs font-semibold px-3 py-1 rounded-full">
          Project {String(index + 1).padStart(2, "0")}
        </div>
      </div>

      {/* Text Panel */}
      <div className="lg:w-[35%] bg-white p-8 lg:p-10 flex flex-col justify-center gap-4">
        <h3 className="font-playfair font-bold text-2xl text-charcoal leading-tight">
          {title}
        </h3>
        {location && (
          <div className="flex items-center gap-2">
            <MapPin
              aria-label="Location"
              aria-hidden={false}
              size={14}
              className="text-terracotta flex-shrink-0"
            />
            <span className="font-inter text-sm font-medium text-terracotta">
              {location}
            </span>
          </div>
        )}
        <p className="font-inter text-charcoal/65 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}
