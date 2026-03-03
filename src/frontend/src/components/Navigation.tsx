import { useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetLogo } from "../hooks/useQueries";
import { useSiteContent } from "../hooks/useSiteContent";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const navigate = useNavigate();
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data: logoData } = useGetLogo();
  const { content: siteContent } = useSiteContent();
  const logoUrl = logoData
    ? logoData.getDirectURL()
    : "/assets/generated/logo-k.dim_200x200.png";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = NAV_LINKS.map((l) => l.href.replace("#", ""));
      for (const section of [...sections].reverse()) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoTap = () => {
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      navigate({ to: "/admin" });
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 1500);
  };

  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const navStyle =
    scrolled && siteContent.graphicsNavBgColor
      ? { backgroundColor: siteContent.graphicsNavBgColor }
      : undefined;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-warm-md" : "bg-transparent"
      }`}
      style={navStyle}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button
            type="button"
            onClick={handleLogoTap}
            className="flex items-center gap-3 focus:outline-none select-none"
            aria-label="Logo"
          >
            <img
              src={logoUrl}
              alt="Khudrang Kalakaar Logo"
              className="h-10 w-10 object-contain"
            />
            <span
              className={`font-playfair font-bold text-xl tracking-wide transition-colors duration-300 ${
                scrolled ? "text-charcoal" : "text-cream"
              }`}
            >
              Khudrang Kalakaar
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <button
                  type="button"
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`font-inter text-sm font-medium transition-colors duration-200 relative group ${
                    scrolled
                      ? isActive
                        ? "text-terracotta"
                        : "text-charcoal hover:text-terracotta"
                      : isActive
                        ? "text-gold"
                        : "text-cream hover:text-gold"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-terracotta transition-all duration-200 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className={`lg:hidden p-2 rounded-md transition-colors ${
              scrolled
                ? "text-charcoal hover:text-terracotta"
                : "text-cream hover:text-gold"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white shadow-warm-lg border-t border-cream-dark">
          <div className="px-4 py-4 flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const id = link.href.replace("#", "");
              const isActive = activeSection === id;
              return (
                <button
                  type="button"
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`text-left px-4 py-3 rounded-lg font-inter text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-terracotta/10 text-terracotta"
                      : "text-charcoal hover:bg-cream hover:text-terracotta"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
