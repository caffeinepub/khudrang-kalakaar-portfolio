import React from 'react';
import ProjectSection from './ProjectSection';

const PROJECTS = [
  {
    number: '01',
    title: 'Café Mural — Jaipur',
    description:
      'A vibrant floor-to-ceiling mural for a boutique café in Jaipur, blending Rajasthani folk motifs with contemporary abstract forms. The 40-foot installation became the café\'s signature visual identity.',
    location: 'Jaipur, Rajasthan',
    image: '/assets/generated/project-cafe.dim_1200x800.png',
    imageAlt: 'Café mural artwork',
    reverse: false,
  },
  {
    number: '02',
    title: 'Fort Resort — Jodhpur',
    description:
      'Heritage-inspired wall art for a luxury fort resort, celebrating the royal history of Jodhpur through intricate hand-painted panels. Each room tells a different chapter of Rajputana heritage.',
    location: 'Jodhpur, Rajasthan',
    image: '/assets/generated/project-fort-resort.dim_1200x800.png',
    imageAlt: 'Fort resort artwork',
    reverse: true,
  },
  {
    number: '03',
    title: 'Boutique Hotel — Udaipur',
    description:
      'A complete interior art program for a lakeside boutique hotel, featuring custom canvas paintings, textured accent walls, and hand-painted ceiling medallions throughout the property.',
    location: 'Udaipur, Rajasthan',
    image: '/assets/generated/project-hotel.dim_1200x800.png',
    imageAlt: 'Hotel interior artwork',
    reverse: false,
  },
  {
    number: '04',
    title: 'Overbridge Art — Ajmer',
    description:
      'A large-scale public art installation on an urban overbridge, transforming a grey concrete structure into a colorful celebration of local culture, history, and community pride.',
    location: 'Ajmer, Rajasthan',
    image: '/assets/generated/project-overbridge.dim_1200x800.png',
    imageAlt: 'Overbridge public art',
    reverse: true,
  },
  {
    number: '05',
    title: 'Restaurant Interior — Kota',
    description:
      'Full interior decoration for a fine-dining restaurant, combining hand-painted murals, custom furniture art, and ambient lighting design to create an immersive dining experience.',
    location: 'Kota, Rajasthan',
    image: '/assets/generated/project-restaurant.dim_1200x800.png',
    imageAlt: 'Restaurant interior',
    reverse: false,
  },
];

export default function FeaturedProjects() {
  return (
    <section id="projects" className="section-padding bg-cream">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-end mb-14">
          <div>
            <span className="text-terracotta text-sm font-semibold tracking-[0.25em] uppercase">
              Featured Work
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-charcoal mt-2 leading-tight">
              Selected{' '}
              <em className="not-italic text-terracotta">Projects</em>
            </h2>
            <div className="w-16 h-1 bg-terracotta mt-4 rounded-full" />
          </div>
          <p className="text-charcoal/65 text-base sm:text-lg leading-relaxed lg:text-right">
            A selection of landmark projects that showcase the breadth and depth of artistic vision — from intimate café murals to grand public installations.
          </p>
        </div>

        {/* Projects */}
        <div className="space-y-16">
          {PROJECTS.map((project) => (
            <ProjectSection key={project.number} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
