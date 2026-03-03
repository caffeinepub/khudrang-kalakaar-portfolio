import { useGetAllArtworks } from '../hooks/useQueries';
import ProjectSection from './ProjectSection';

const STATIC_PROJECTS = [
  {
    title: 'Café Mural — Vibrant Wall Art',
    description:
      'A lively mural installation for a modern café, blending abstract patterns with cultural motifs to create an immersive dining experience.',
    image: '/assets/generated/project-cafe.dim_1200x800.png',
  },
  {
    title: 'Fort Resort — Heritage Murals',
    description:
      'Intricate heritage-inspired murals for a luxury fort resort, celebrating Rajasthani art traditions with contemporary finesse.',
    image: '/assets/generated/project-fort-resort.dim_1200x800.png',
  },
  {
    title: 'Hotel Lobby — Statement Artwork',
    description:
      'A grand statement artwork for a five-star hotel lobby, combining gold leaf accents with hand-painted motifs for a lasting impression.',
    image: '/assets/generated/project-hotel.dim_1200x800.png',
  },
  {
    title: 'Overbridge — Public Art Installation',
    description:
      'A large-scale public art installation on an urban overbridge, transforming a functional structure into a vibrant community landmark.',
    image: '/assets/generated/project-overbridge.dim_1200x800.png',
  },
  {
    title: 'Restaurant — Thematic Interior',
    description:
      'A thematic interior mural series for a fine-dining restaurant, weaving local folklore and culinary heritage into every brushstroke.',
    image: '/assets/generated/project-restaurant.dim_1200x800.png',
  },
];

export default function FeaturedProjects() {
  const { data: artworks } = useGetAllArtworks();

  // Build a map from title to location for dynamic location lookup
  const locationMap: Record<string, string> = {};
  if (artworks) {
    for (const artwork of artworks) {
      if (artwork.location) {
        locationMap[artwork.title] = artwork.location;
      }
    }
  }

  // Also try to match by index order if artworks exist
  const artworksByIndex = artworks ? [...artworks].sort((a, b) => Number(a.id) - Number(b.id)) : [];

  return (
    <section id="projects" className="py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="font-inter text-terracotta font-semibold text-sm uppercase tracking-widest mb-3">
            Our Work
          </p>
          <h2 className="font-playfair font-bold text-4xl lg:text-5xl text-charcoal leading-tight">
            Featured{' '}
            <em className="text-terracotta not-italic">Projects</em>
          </h2>
          <p className="mt-4 font-inter text-charcoal/65 max-w-2xl mx-auto leading-relaxed">
            A curated selection of our most impactful mural and wall art installations across
            Rajasthan and beyond.
          </p>
        </div>

        {/* Projects List */}
        <div className="flex flex-col gap-10">
          {STATIC_PROJECTS.map((project, index) => {
            // Try to find location: first by title match, then by index
            const locationByTitle = locationMap[project.title];
            const locationByIndex = artworksByIndex[index]?.location;
            const location = locationByTitle || locationByIndex || undefined;

            return (
              <ProjectSection
                key={project.title}
                title={project.title}
                description={project.description}
                image={project.image}
                location={location}
                reversed={index % 2 !== 0}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
