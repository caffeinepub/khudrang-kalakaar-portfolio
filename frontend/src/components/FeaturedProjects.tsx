import ProjectSection from './ProjectSection';

const PROJECTS = [
  {
    name: 'Café Wall Art Project',
    description:
      'This café wall painting was designed to create a vibrant and Instagram-worthy atmosphere. The artwork enhances the overall interior vibe and attracts customer attention while maintaining a modern aesthetic feel.',
    imageSrc: '/assets/generated/project-cafe.dim_1200x800.png',
    imageAlt: 'Café Wall Art Mural',
    reverse: false,
  },
  {
    name: 'Sawai Madhopur Overbridge',
    description:
      'This public infrastructure mural was created to beautify the overbridge space and reflect cultural identity. The artwork adds positivity and visual appeal to the urban environment.',
    location: 'Sawai Madhopur',
    imageSrc: '/assets/generated/project-overbridge.dim_1200x800.png',
    imageAlt: 'Sawai Madhopur Overbridge Mural',
    reverse: true,
  },
  {
    name: 'Sanskriti Fort & Resort',
    description:
      'The artwork at Sanskriti Fort & Resort complements the heritage theme of the property. The design enhances the royal ambiance while maintaining fine detailing and artistic balance.',
    imageSrc: '/assets/generated/project-fort-resort.dim_1200x800.png',
    imageAlt: 'Sanskriti Fort & Resort Wall Art',
    reverse: false,
  },
  {
    name: 'Hotel & Resort Wall Art',
    description:
      'This hospitality project was designed to elevate guest experience through creative visual storytelling. The murals add character and sophistication to the space.',
    imageSrc: '/assets/generated/project-hotel.dim_1200x800.png',
    imageAlt: 'Hotel & Resort Wall Art Mural',
    reverse: true,
  },
  {
    name: 'Jiman Restaurant – Bikaner',
    description:
      'The wall painting was crafted to match the traditional vibe of the restaurant. The artwork enhances customer engagement and creates a memorable dining atmosphere.',
    location: 'Bikaner',
    imageSrc: '/assets/generated/project-restaurant.dim_1200x800.png',
    imageAlt: 'Jiman Restaurant Wall Painting',
    reverse: false,
  },
];

export default function FeaturedProjects() {
  return (
    <section id="projects" className="bg-white">
      {/* Section Header */}
      <div className="py-16 px-6 md:px-12 lg:px-20 text-center border-b border-border bg-secondary">
        <p className="text-terracotta text-sm font-semibold tracking-widest uppercase mb-3">
          Our Work
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Featured Projects</h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-terracotta/40" />
          <div className="w-2 h-2 rounded-full bg-terracotta" />
          <div className="h-px w-12 bg-terracotta/40" />
        </div>
        <p className="text-foreground/60 text-base mt-5 max-w-xl mx-auto">
          A selection of our finest wall painting projects across residential, commercial, and public spaces.
        </p>
      </div>

      {/* Projects */}
      <div className="border-t border-border">
        {PROJECTS.map((project, idx) => (
          <ProjectSection
            key={idx}
            index={idx + 1}
            name={project.name}
            description={project.description}
            location={project.location}
            imageSrc={project.imageSrc}
            imageAlt={project.imageAlt}
            reverse={project.reverse}
          />
        ))}
      </div>
    </section>
  );
}
