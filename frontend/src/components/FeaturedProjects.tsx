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
    <section id="projects" className="bg-background">
      {/* Section Header */}
      <div className="py-20 px-6 md:px-12 lg:px-20 bg-secondary border-b border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="terracotta-label mb-4">Our Work</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-foreground leading-tight">
              Featured <span className="italic text-terracotta">Projects</span>
            </h2>
          </div>
          <p className="font-body text-foreground/55 text-base max-w-sm leading-relaxed">
            A selection of our finest wall painting projects across residential, commercial, and public spaces.
          </p>
        </div>
      </div>

      {/* Projects */}
      <div>
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
