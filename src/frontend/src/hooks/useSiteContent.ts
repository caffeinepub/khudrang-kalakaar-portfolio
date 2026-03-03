import { useEffect, useState } from "react";

// Store and retrieve editable site text in localStorage
// Key: "khudrang_site_content"

export interface SiteContent {
  artistName: string;
  heroTagline: string;
  aboutBio: string;
  location: string;
  heroSubtitle: string;
  servicesIntro: string;
  whyChooseIntro: string;
  contactHeading: string;
  contactSubtext: string;
  // Hero Stats (cover/hero section)
  heroStat1Value: string;
  heroStat1Label: string;
  heroStat2Value: string;
  heroStat2Label: string;
  heroStat3Value: string;
  heroStat3Label: string;
  // About Section Stats
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;
  // Typography (global)
  fontFamily: string;
  primaryTextColor: string;
  accentColor: string;
  // Per-field font colors
  artistNameColor: string;
  heroTaglineColor: string;
  heroSubtitleColor: string;
  aboutBioColor: string;
  locationColor: string;
  servicesIntroColor: string;
  whyChooseIntroColor: string;
  contactHeadingColor: string;
  contactSubtextColor: string;
  heroStat1ValueColor: string;
  heroStat1LabelColor: string;
  heroStat2ValueColor: string;
  heroStat2LabelColor: string;
  heroStat3ValueColor: string;
  heroStat3LabelColor: string;
  stat1ValueColor: string;
  stat1LabelColor: string;
  stat2ValueColor: string;
  stat2LabelColor: string;
  stat3ValueColor: string;
  stat3LabelColor: string;
  stat4ValueColor: string;
  stat4LabelColor: string;
  // Graphics & UI Colors
  graphicsAccentColor: string;
  graphicsNavBgColor: string;
  graphicsHeroBtnColor: string;
  graphicsCardBorderColor: string;
  graphicsSectionBgColor: string;
}

const DEFAULTS: SiteContent = {
  artistName: "Mudit Sharma",
  heroTagline: "Transforming Blank Walls into Meaningful Art.",
  aboutBio:
    "Mudit Sharma is a professional wall painting artist based in Bikaner, Rajasthan, with over 5 years of experience in residential, commercial, and public mural projects. He specializes in customized wall art that enhances spaces and creates strong visual impact. His focus is on clean finishing, creative concepts, and complete client satisfaction.",
  location: "Bikaner, Rajasthan",
  heroSubtitle: "Professional Wall Painting Artist",
  servicesIntro:
    "We offer a wide range of wall art and mural services tailored to your space.",
  whyChooseIntro:
    "Here's why clients trust Mudit Sharma for their wall art needs.",
  contactHeading: "Let's Transform Your Space",
  contactSubtext:
    "Available for residential and commercial projects across Rajasthan.",
  // Hero section stats (cover page)
  heroStat1Value: "5+",
  heroStat1Label: "Years Experience",
  heroStat2Value: "150+",
  heroStat2Label: "Projects Done",
  heroStat3Value: "12+",
  heroStat3Label: "Happy Clients",
  // About section stats
  stat1Value: "5+",
  stat1Label: "Years of Experience",
  stat2Value: "150+",
  stat2Label: "Masterpieces",
  stat3Value: "12+",
  stat3Label: "City Landmarks",
  stat4Value: "50k+",
  stat4Label: "Sq. Ft. Painted",
  // Typography defaults
  fontFamily: "Inter",
  primaryTextColor: "#1a1a2e",
  accentColor: "#c0392b",
  // Per-field color defaults (empty string = use global/component default)
  artistNameColor: "",
  heroTaglineColor: "",
  heroSubtitleColor: "",
  aboutBioColor: "",
  locationColor: "",
  servicesIntroColor: "",
  whyChooseIntroColor: "",
  contactHeadingColor: "",
  contactSubtextColor: "",
  heroStat1ValueColor: "",
  heroStat1LabelColor: "",
  heroStat2ValueColor: "",
  heroStat2LabelColor: "",
  heroStat3ValueColor: "",
  heroStat3LabelColor: "",
  stat1ValueColor: "",
  stat1LabelColor: "",
  stat2ValueColor: "",
  stat2LabelColor: "",
  stat3ValueColor: "",
  stat3LabelColor: "",
  stat4ValueColor: "",
  stat4LabelColor: "",
  // Graphics & UI Colors
  graphicsAccentColor: "#c0392b",
  graphicsNavBgColor: "",
  graphicsHeroBtnColor: "",
  graphicsCardBorderColor: "",
  graphicsSectionBgColor: "",
};

const STORAGE_KEY = "khudrang_site_content";

export function getSiteContent(): SiteContent {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSiteContent(content: SiteContent): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
}

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(() => getSiteContent());

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setContent(getSiteContent());
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const updateContent = (updates: Partial<SiteContent>) => {
    const newContent = { ...content, ...updates };
    saveSiteContent(newContent);
    setContent(newContent);
  };

  return { content, updateContent };
}
