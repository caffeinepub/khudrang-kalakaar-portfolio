import React from 'react';
import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ServicesSection from '../components/ServicesSection';
import WhyChooseSection from '../components/WhyChooseSection';
import FeaturedProjects from '../components/FeaturedProjects';
import GallerySection from '../components/GallerySection';
import QRSection from '../components/QRSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function PortfolioPage() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <WhyChooseSection />
        <FeaturedProjects />
        <GallerySection />
        <QRSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
