import React, { useEffect } from "react";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import FeaturedProjects from "../components/FeaturedProjects";
import Footer from "../components/Footer";
import GallerySection from "../components/GallerySection";
import HeroSection from "../components/HeroSection";
import Navigation from "../components/Navigation";
import ServicesSection from "../components/ServicesSection";
import WhyChooseSection from "../components/WhyChooseSection";
import { useSiteContent } from "../hooks/useSiteContent";

// Map font family names to Google Fonts URL slugs
const GOOGLE_FONT_MAP: Record<string, string> = {
  Inter: "Inter:wght@300;400;500;600;700",
  "Playfair Display": "Playfair+Display:wght@400;600;700",
  Poppins: "Poppins:wght@300;400;500;600;700",
  Montserrat: "Montserrat:wght@300;400;500;600;700",
  Lato: "Lato:wght@300;400;700",
  Raleway: "Raleway:wght@300;400;500;600;700",
  Oswald: "Oswald:wght@300;400;500;600;700",
  Merriweather: "Merriweather:wght@300;400;700",
  Nunito: "Nunito:wght@300;400;500;600;700",
  Roboto: "Roboto:wght@300;400;500;700",
  "Open Sans": "Open+Sans:wght@300;400;500;600;700",
  "Dancing Script": "Dancing+Script:wght@400;600;700",
};

export default function PortfolioPage() {
  const { content: siteContent } = useSiteContent();

  // Load selected Google Font dynamically
  useEffect(() => {
    const fontName = siteContent.fontFamily || "Inter";
    const fontSlug = GOOGLE_FONT_MAP[fontName];
    if (!fontSlug) return;

    const linkId = "site-custom-font";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${fontSlug}&display=swap`;
  }, [siteContent.fontFamily]);

  // Apply CSS variables for font and colors to :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--site-font",
      `"${siteContent.fontFamily || "Inter"}", sans-serif`,
    );
    root.style.setProperty(
      "--site-primary-color",
      siteContent.primaryTextColor || "#1a1a2e",
    );
    root.style.setProperty(
      "--site-accent-color",
      siteContent.accentColor || "#c0392b",
    );
  }, [
    siteContent.fontFamily,
    siteContent.primaryTextColor,
    siteContent.accentColor,
  ]);

  return (
    <>
      <Navigation />
      <main
        style={{
          fontFamily: "var(--site-font)",
          color: "var(--site-primary-color)",
        }}
      >
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <WhyChooseSection />
        <FeaturedProjects />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
