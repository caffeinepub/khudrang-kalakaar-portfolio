import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import WhyChooseSection from './components/WhyChooseSection';
import FeaturedProjects from './components/FeaturedProjects';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen font-poppins">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <WhyChooseSection />
        <FeaturedProjects />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
