import { Palette } from "lucide-react";
import { useGetAllArtworks } from "../hooks/useQueries";
import ProjectSection from "./ProjectSection";

export default function FeaturedProjects() {
  const { data: artworks, isLoading } = useGetAllArtworks();

  const hasArtworks = artworks && artworks.length > 0;

  return (
    <section id="projects" className="py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-inter text-terracotta font-semibold text-sm uppercase tracking-widest mb-3">
            Our Work
          </p>
          <h2 className="font-playfair font-bold text-4xl lg:text-5xl text-charcoal leading-tight">
            Featured <em className="text-terracotta not-italic">Projects</em>
          </h2>
          <p className="mt-4 font-inter text-charcoal/65 max-w-2xl mx-auto leading-relaxed">
            A curated selection of our most impactful mural and wall art
            installations across Rajasthan and beyond.
          </p>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="flex flex-col gap-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col lg:flex-row min-h-[420px] overflow-hidden rounded-2xl shadow-warm-lg animate-pulse"
              >
                <div className="lg:w-[65%] bg-charcoal/10 h-64 lg:h-auto" />
                <div className="lg:w-[35%] bg-white p-10 flex flex-col gap-4">
                  <div className="h-6 bg-charcoal/10 rounded w-3/4" />
                  <div className="h-4 bg-charcoal/10 rounded w-1/3" />
                  <div className="h-4 bg-charcoal/10 rounded w-full" />
                  <div className="h-4 bg-charcoal/10 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : !hasArtworks ? (
          <div
            data-ocid="projects.empty_state"
            className="flex flex-col items-center justify-center py-24 px-6 bg-white rounded-2xl border-2 border-dashed border-terracotta/20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-terracotta/10 flex items-center justify-center mb-5">
              <Palette size={36} className="text-terracotta/50" />
            </div>
            <h3 className="font-playfair font-bold text-2xl text-charcoal mb-2">
              No projects yet
            </h3>
            <p className="font-inter text-charcoal/55 text-base max-w-md">
              Check back soon! New projects will be added here as they are
              completed.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {artworks.map((artwork, index) => (
              <ProjectSection
                key={String(artwork.id)}
                title={artwork.title}
                description={artwork.description}
                image={
                  artwork.image
                    ? artwork.image.getDirectURL()
                    : "/assets/generated/project-cafe.dim_1200x800.png"
                }
                location={artwork.location ?? undefined}
                reversed={index % 2 !== 0}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
